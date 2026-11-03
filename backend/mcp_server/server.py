"""Draft-writing tools for Claude, served at /mcp. There is deliberately no publish or delete."""

from html import escape
from html.parser import HTMLParser
from typing import Optional

from fastapi import HTTPException
from mcp.server.auth.settings import AuthSettings, ClientRegistrationOptions, RevocationOptions
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import BaseModel

from config import get_settings
from database import SessionLocal
from models.embed import Embed
from models.post import BlogPost
from schemas.post import PostInput, PostOutput
from services import post as post_service
from services.embed import validate_embed_html
from mcp_server.oauth import oauth_provider

config = get_settings()

DEFAULT_EMBED_HEIGHT = 480

# What the admin editor (TipTap) keeps when it opens a post; anything else is silently dropped.
EDITOR_TAGS = {
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "br", "hr",
    "strong", "b", "em", "i", "u", "s", "strike", "del", "mark", "code", "a",
    "pre", "blockquote", "ul", "ol", "li", "img",
    "div", "span", "label", "input",  # task lists and the youtube wrapper
    "figure", "figcaption", "iframe",  # visualisers and youtube
}

INSTRUCTIONS = f"""Write drafts for the Not a Blogger engineering blog.
Post content is HTML limited to these tags: {", ".join(sorted(EDITOR_TAGS))}.
Code goes in <pre><code class="language-python">…</code></pre>. Leave images out; the author adds them.
For an interactive visualiser, create the draft first, call attach_embed with its id, and put the
returned <figure> snippet into the content with update_draft.
Every tool returns an edit_url: give it to the author, who reviews and publishes from the admin."""


class _EditorHTMLCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.problems: list[str] = []
        self.stack: list[tuple[str, dict]] = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag not in EDITOR_TAGS:
            self.problems.append(f"<{tag}> is not supported by the editor")
        if tag == "iframe" and not any(
            "data-embed-id" in parent_attrs or "data-youtube-video" in parent_attrs
            for _, parent_attrs in self.stack
        ):
            self.problems.append("<iframe> is only allowed inside an attach_embed <figure> or a youtube block")
        for name, value in attributes.items():
            if name.startswith("on") or (value or "").strip().lower().startswith("javascript:"):
                self.problems.append(f'attribute {name}="{value}" on <{tag}> is not allowed')
        if tag not in ("br", "hr", "img", "input"):
            self.stack.append((tag, attributes))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def check_editor_html(content: str) -> None:
    checker = _EditorHTMLCheck()
    checker.feed(content)
    checker.close()
    if checker.problems:
        raise ToolError("Content would lose parts in the editor: " + "; ".join(sorted(set(checker.problems))))


class DraftRef(BaseModel):
    id: str
    title: str
    slug: str
    edit_url: str


class PostWithLink(PostOutput):
    edit_url: str


class EmbedRef(BaseModel):
    embed_id: str
    figure: str
    edit_url: str


def _edit_url(post_id: str) -> str:
    return f"{config.SITE_URL}/admin/edit/{post_id}"


def _draft_ref(post: BlogPost) -> DraftRef:
    return DraftRef(id=post.id, title=post.title, slug=post.slug, edit_url=_edit_url(post.id))


def _load_draft(db, post_id: str) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if not post:
        raise ToolError(f"No post with id {post_id}")
    if post.is_published:
        raise ToolError("That post is published; edit it in the admin instead")
    return post


def _embed_figure(embed_id: str, title: str) -> str:
    title = escape(title, quote=True)
    # Mirrors renderHTML in frontend/src/features/editor/extensions/Embed.ts.
    return (
        f'<figure data-embed-id="{embed_id}" data-embed-title="{title}" '
        f'data-embed-height="{DEFAULT_EMBED_HEIGHT}" class="not-prose my-8">'
        f'<iframe data-embed-frame="" sandbox="allow-scripts" loading="lazy" title="{title}" '
        f'style="display:block;width:100%;border:0;height:{DEFAULT_EMBED_HEIGHT}px"></iframe>'
        f'<figcaption class="mt-3 font-mono text-xs text-zinc-500">{title}</figcaption></figure>'
    )


mcp = MCPServer(
    name="Not a Blogger",
    instructions=INSTRUCTIONS,
    auth_server_provider=oauth_provider,
    auth=AuthSettings(
        issuer_url=config.API_URL,
        resource_server_url=f"{config.API_URL}/mcp",
        validate_token_resource=False,
        client_registration_options=ClientRegistrationOptions(enabled=True),
        revocation_options=RevocationOptions(enabled=True),
    ),
)


@mcp.tool()
def create_draft(
    title: str,
    content: str,
    excerpt: Optional[str] = None,
    tags: Optional[list[str]] = None,
    series: Optional[str] = None,
    series_order: Optional[int] = None,
) -> DraftRef:
    """Create an unpublished post. Content is editor HTML (see the server instructions)."""
    check_editor_html(content)
    post_data = PostInput(
        title=title, content=content, excerpt=excerpt, tags=tags or [],
        series=series, series_order=series_order, is_published=False,
    )
    with SessionLocal() as db:
        return _draft_ref(post_service.create_post(db, post_data))


@mcp.tool()
def update_draft(
    post_id: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    excerpt: Optional[str] = None,
    tags: Optional[list[str]] = None,
    series: Optional[str] = None,
    series_order: Optional[int] = None,
) -> DraftRef:
    """Change fields of a draft. Fields left out keep their current value. Published posts are refused."""
    if content is not None:
        check_editor_html(content)
    changes = {
        name: value
        for name, value in dict(
            title=title, content=content, excerpt=excerpt, tags=tags, series=series, series_order=series_order
        ).items()
        if value is not None
    }
    with SessionLocal() as db:
        post = _load_draft(db, post_id)
        current = PostOutput.model_validate(post).model_dump(include=set(PostInput.model_fields))
        post_data = PostInput(**{**current, **changes, "is_published": False})
        return _draft_ref(post_service.update_post(db, post, post_data))


@mcp.tool()
def get_post(id_or_slug: str) -> PostWithLink:
    """Read any post, draft or published, by id or slug."""
    with SessionLocal() as db:
        post = db.get(BlogPost, id_or_slug) or db.query(BlogPost).filter(BlogPost.slug == id_or_slug).first()
        if not post:
            raise ToolError(f"No post with id or slug {id_or_slug}")
        return PostWithLink(**PostOutput.model_validate(post).model_dump(), edit_url=_edit_url(post.id))


@mcp.tool()
def list_drafts() -> list[DraftRef]:
    """List unpublished posts, most recently edited first."""
    with SessionLocal() as db:
        drafts = (
            db.query(BlogPost)
            .filter(BlogPost.is_published.is_(False))
            .order_by(BlogPost.updated_at.desc())
            .all()
        )
        return [_draft_ref(post) for post in drafts]


@mcp.tool()
def attach_embed(post_id: str, title: str, html: str) -> EmbedRef:
    """Store a self-contained HTML visualiser for a draft and return the <figure> to place in its content."""
    try:
        html, content_hash, byte_size = validate_embed_html(html.encode())
    except HTTPException as error:
        raise ToolError(error.detail)

    with SessionLocal() as db:
        _load_draft(db, post_id)
        embed = Embed(post_id=post_id, title=title, html=html, content_hash=content_hash, byte_size=byte_size)
        db.add(embed)
        db.commit()
        return EmbedRef(embed_id=embed.id, figure=_embed_figure(embed.id, title), edit_url=_edit_url(post_id))


# Stateless so either gunicorn worker can answer any request. Host checks guard local servers
# against DNS rebinding; this one is public and every request carries a bearer token instead.
mcp_app = mcp.streamable_http_app(
    stateless_http=True,
    json_response=True,
    transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
)
MCP_PATHS = {route.path for route in mcp_app.routes}


class MCPRoutes:
    """Hands the MCP and OAuth paths to the MCP app before FastAPI routing sees them."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["path"] in MCP_PATHS:
            await mcp_app(scope, receive, send)
        else:
            await self.app(scope, receive, send)
