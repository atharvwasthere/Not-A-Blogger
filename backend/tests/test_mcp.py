import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

import pytest

from database import SessionLocal
from models.oauth import OAuthCode
from models.post import BlogPost
from services.auth import verify_token
from tests.conftest import API_URL

CALLBACK = "https://claude.ai/api/mcp/auth_callback"
MCP_HEADERS = {"Accept": "application/json, text/event-stream", "Content-Type": "application/json"}


def register(client, redirect_uri=CALLBACK):
    return client.post(
        "/register",
        json={"redirect_uris": [redirect_uri], "token_endpoint_auth_method": "none", "client_name": "Claude"},
    )


def pkce():
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


def start_authorize(client, client_id, challenge):
    res = client.get(
        "/authorize",
        params={
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": CALLBACK,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "state": "st-1",
        },
        follow_redirects=False,
    )
    assert res.status_code == 302, res.text
    location = urlparse(res.headers["location"])
    assert location.path == "/api/oauth/consent"
    return parse_qs(location.query)["request"][0]


def approve(client, request_token, decision="approve", origin=API_URL):
    return client.post(
        "/api/oauth/consent",
        data={"request": request_token, "decision": decision},
        headers={"Origin": origin},
        follow_redirects=False,
    )


def exchange_code(client, client_id, code, verifier):
    return client.post(
        "/token",
        data={
            "grant_type": "authorization_code",
            "client_id": client_id,
            "code": code,
            "code_verifier": verifier,
            "redirect_uri": CALLBACK,
        },
    )


def connect(client):
    """Run the whole Claude connection flow and return (client_id, token response)."""
    client_id = register(client).json()["client_id"]
    verifier, challenge = pkce()
    request_token = start_authorize(client, client_id, challenge)
    code = parse_qs(urlparse(approve(client, request_token).headers["location"]).query)["code"][0]
    return client_id, exchange_code(client, client_id, code, verifier).json()


def call_tool(client, access_token, name, arguments):
    res = client.post(
        "/mcp",
        headers={**MCP_HEADERS, "Authorization": f"Bearer {access_token}"},
        json={"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": name, "arguments": arguments}},
    )
    assert res.status_code == 200, res.text
    return res.json()["result"]


def make_post(**fields):
    with SessionLocal() as db:
        post = BlogPost(title="Seed", slug=f"seed-{secrets.token_hex(4)}", content="<p>x</p>", **fields)
        db.add(post)
        db.commit()
        return post.id


def test_metadata_points_at_this_server(client):
    meta = client.get("/.well-known/oauth-authorization-server").json()
    assert meta["issuer"].rstrip("/") == API_URL
    assert meta["registration_endpoint"] == f"{API_URL}/register"
    assert client.get("/.well-known/oauth-protected-resource/mcp").status_code == 200


@pytest.mark.parametrize("uri", ["https://evil.example/callback", "https://claude.ai.evil.example/api/mcp/auth_callback"])
def test_registration_refuses_non_claude_redirects(client, uri):
    res = register(client, uri)
    assert res.status_code == 400
    assert res.json()["error"] == "invalid_redirect_uri"


def test_registration_accepts_claude_and_loopback(client):
    assert register(client).status_code == 201
    assert register(client, "http://localhost:33418/callback").status_code == 201


def test_consent_sends_signed_out_admin_to_github(client):
    client_id = register(client).json()["client_id"]
    request_token = start_authorize(client, client_id, pkce()[1])

    res = client.get("/api/oauth/consent", params={"request": request_token}, follow_redirects=False)

    location = urlparse(res.headers["location"])
    assert location.path == "/api/auth/github/login"
    assert parse_qs(location.query)["next"][0].startswith("/api/oauth/consent?request=")


def test_consent_request_is_not_an_admin_session(client):
    client_id = register(client).json()["client_id"]
    request_token = start_authorize(client, client_id, pkce()[1])
    assert verify_token(request_token) is None


def test_full_flow_issues_tokens_once(admin_client):
    client_id = register(admin_client).json()["client_id"]
    verifier, challenge = pkce()
    request_token = start_authorize(admin_client, client_id, challenge)

    page = admin_client.get("/api/oauth/consent", params={"request": request_token})
    assert "Approve" in page.text

    res = approve(admin_client, request_token)
    query = parse_qs(urlparse(res.headers["location"]).query)
    assert res.headers["location"].startswith(CALLBACK)
    assert query["state"] == ["st-1"]

    tokens = exchange_code(admin_client, client_id, query["code"][0], verifier)
    assert tokens.status_code == 200, tokens.text
    assert tokens.json()["expires_in"] == 3600

    reused = exchange_code(admin_client, client_id, query["code"][0], verifier)
    assert reused.status_code == 400
    assert reused.json()["error"] == "invalid_grant"


def test_wrong_pkce_verifier_is_refused(admin_client):
    client_id = register(admin_client).json()["client_id"]
    request_token = start_authorize(admin_client, client_id, pkce()[1])
    code = parse_qs(urlparse(approve(admin_client, request_token).headers["location"]).query)["code"][0]

    assert exchange_code(admin_client, client_id, code, pkce()[0]).status_code == 400


def test_expired_code_is_refused(admin_client):
    client_id = register(admin_client).json()["client_id"]
    verifier, challenge = pkce()
    request_token = start_authorize(admin_client, client_id, challenge)
    code = parse_qs(urlparse(approve(admin_client, request_token).headers["location"]).query)["code"][0]

    with SessionLocal() as db:
        db.query(OAuthCode).update({"expires_at": datetime.utcnow() - timedelta(seconds=1)})
        db.commit()

    assert exchange_code(admin_client, client_id, code, verifier).status_code == 400


def test_deny_returns_access_denied(admin_client):
    client_id = register(admin_client).json()["client_id"]
    request_token = start_authorize(admin_client, client_id, pkce()[1])

    res = approve(admin_client, request_token, decision="deny")

    assert parse_qs(urlparse(res.headers["location"]).query)["error"] == ["access_denied"]


def test_cross_site_approval_is_refused(admin_client):
    client_id = register(admin_client).json()["client_id"]
    request_token = start_authorize(admin_client, client_id, pkce()[1])

    assert approve(admin_client, request_token, origin="https://evil.example").status_code == 403


def test_refresh_rotates_and_kills_the_old_pair(admin_client):
    client_id, tokens = connect(admin_client)

    refreshed = admin_client.post(
        "/token", data={"grant_type": "refresh_token", "client_id": client_id, "refresh_token": tokens["refresh_token"]}
    )
    assert refreshed.status_code == 200, refreshed.text
    assert refreshed.json()["refresh_token"] != tokens["refresh_token"]

    replay = admin_client.post(
        "/token", data={"grant_type": "refresh_token", "client_id": client_id, "refresh_token": tokens["refresh_token"]}
    )
    assert replay.status_code == 400
    old_access = admin_client.post("/mcp", headers={**MCP_HEADERS, "Authorization": f"Bearer {tokens['access_token']}"}, json={})
    assert old_access.status_code == 401


def test_mcp_requires_a_token(client):
    res = client.post("/mcp", headers=MCP_HEADERS, json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
    assert res.status_code == 401
    assert "resource_metadata" in res.headers["www-authenticate"]


def test_create_draft_over_mcp(admin_client):
    _, tokens = connect(admin_client)

    result = call_tool(admin_client, tokens["access_token"], "create_draft", {"title": "Leases", "content": "<p>Hi</p>"})

    assert not result.get("isError"), result
    with SessionLocal() as db:
        post = db.query(BlogPost).filter(BlogPost.title == "Leases").one()
        assert post.is_published is False
        assert post.reading_time == 1


@pytest.mark.parametrize("content", ["<script>alert(1)</script>", "<table><tr><td>x</td></tr></table>", "<iframe src='x'></iframe>", '<a href="javascript:alert(1)">x</a>'])
def test_html_the_editor_would_drop_is_refused(admin_client, content):
    _, tokens = connect(admin_client)

    result = call_tool(admin_client, tokens["access_token"], "create_draft", {"title": "Bad", "content": content})

    assert result["isError"] is True
    with SessionLocal() as db:
        assert db.query(BlogPost).count() == 0


def test_published_posts_cannot_be_changed(admin_client):
    _, tokens = connect(admin_client)
    post_id = make_post(is_published=True)

    for name, arguments in [
        ("update_draft", {"post_id": post_id, "title": "Changed"}),
        ("attach_embed", {"post_id": post_id, "title": "Fig", "html": "<!doctype html><p>x</p>"}),
    ]:
        assert call_tool(admin_client, tokens["access_token"], name, arguments)["isError"] is True

    with SessionLocal() as db:
        assert db.get(BlogPost, post_id).title == "Seed"


def test_update_draft_keeps_untouched_fields(admin_client):
    _, tokens = connect(admin_client)
    post_id = make_post(is_published=False, excerpt="keep me", tags=["caching"])

    call_tool(admin_client, tokens["access_token"], "update_draft", {"post_id": post_id, "content": "<p>New</p>"})

    with SessionLocal() as db:
        post = db.get(BlogPost, post_id)
        assert (post.content, post.excerpt, post.tags, post.is_published) == ("<p>New</p>", "keep me", ["caching"], False)


def test_attach_embed_returns_editor_figure(admin_client):
    _, tokens = connect(admin_client)
    post_id = make_post(is_published=False)

    result = call_tool(
        admin_client, tokens["access_token"], "attach_embed",
        {"post_id": post_id, "title": "Lease race", "html": "<!doctype html><p>x</p>"},
    )

    figure = result["structuredContent"]["figure"]
    assert figure.startswith('<figure data-embed-id="')
    assert 'data-embed-title="Lease race"' in figure
    assert 'sandbox="allow-scripts"' in figure
    assert "src=" not in figure


def test_list_drafts_and_get_post(admin_client):
    _, tokens = connect(admin_client)
    draft_id = make_post(is_published=False)
    make_post(is_published=True)

    drafts = call_tool(admin_client, tokens["access_token"], "list_drafts", {})["structuredContent"]["result"]
    assert [d["id"] for d in drafts] == [draft_id]

    with SessionLocal() as db:
        slug = db.get(BlogPost, draft_id).slug
    post = call_tool(admin_client, tokens["access_token"], "get_post", {"id_or_slug": slug})["structuredContent"]
    assert post["id"] == draft_id
    assert post["edit_url"].endswith(f"/admin/edit/{draft_id}")


REFERENCE = (
    '<li data-kind="{kind}"><a href="https://www.npmjs.com/package/archiver">archiver</a>'
    '<span data-source="">npm package</span><p data-note="">{note}</p>'
    '<code data-install="">npm i archiver</code></li>'
)


def references(*items):
    return f'<p>Body</p><section data-references=""><h2>References</h2><ol>{"".join(items)}</ol></section>'


def test_valid_references_block_is_accepted(admin_client):
    _, tokens = connect(admin_client)
    content = references(
        REFERENCE.format(kind="package", note="What V3 streams every file through."),
        REFERENCE.format(kind="article", note="Read this for STORE mode."),
    )

    result = call_tool(admin_client, tokens["access_token"], "create_draft", {"title": "Refs", "content": content})

    assert not result.get("isError"), result
    with SessionLocal() as db:
        assert db.query(BlogPost).one().content == content


@pytest.mark.parametrize(
    "item, message",
    [
        (REFERENCE.format(kind="package", note="  "), "Each reference needs a link and a note"),
        ('<li data-kind="repo"><a href="https://github.com/a/b">b</a></li>', "Each reference needs a link and a note"),
        ('<li data-kind="repo"><span data-source="">x</span><p data-note="">Why</p></li>', "Each reference needs a link and a note"),
        (REFERENCE.format(kind="video", note="Why"), "reference kind 'video'"),
        (REFERENCE.format(kind="package", note="Why").replace(' data-kind="package"', ""), "reference kind None"),
    ],
)
def test_invalid_references_are_refused(admin_client, item, message):
    _, tokens = connect(admin_client)

    result = call_tool(admin_client, tokens["access_token"], "create_draft", {"title": "Refs", "content": references(item)})

    assert result["isError"] is True
    assert message in result["content"][0]["text"]
    with SessionLocal() as db:
        assert db.query(BlogPost).count() == 0


@pytest.mark.parametrize(
    "content",
    [
        "<section><p>x</p></section>",
        references(REFERENCE.format(kind="package", note="Why")) * 2,
    ],
)
def test_only_one_references_section_is_allowed(admin_client, content):
    _, tokens = connect(admin_client)
    result = call_tool(admin_client, tokens["access_token"], "create_draft", {"title": "Refs", "content": content})
    assert result["isError"] is True


def test_drafts_accept_based_on(admin_client):
    _, tokens = connect(admin_client)
    paper = {"title": "Scaling Memcache at Facebook", "by": "Nishtala et al.", "url": "https://www.usenix.org/nsdi13"}

    created = call_tool(
        admin_client, tokens["access_token"], "create_draft", {"title": "Paper", "content": "<p>x</p>", "based_on": paper}
    )
    post_id = created["structuredContent"]["id"]
    call_tool(admin_client, tokens["access_token"], "update_draft", {"post_id": post_id, "content": "<p>y</p>"})

    with SessionLocal() as db:
        assert db.get(BlogPost, post_id).based_on == paper
