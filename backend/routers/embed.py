from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.embed import Embed
from models.post import BlogPost
from schemas.embed import EmbedSummary
from middleware.auth import require_authentication
from services.embed import read_embed_file

embeds_router = APIRouter(prefix="/embeds", tags=["Embeds"])

# Sandboxing lives on the response, not just the iframe tag, so opening this URL
# directly is isolated too.
DOCUMENT_HEADERS = {
    "Content-Security-Policy": "sandbox allow-scripts",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline",
    "Cache-Control": "no-cache",
}

MISSING_EMBED_HTML = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Unavailable</title>
<style>body{margin:0;display:grid;place-items:center;min-height:140px;
font:13px ui-monospace,SFMono-Regular,Menlo,monospace;color:#71717a;background:#fafafa}</style>
</head><body>This visualiser is no longer available.</body></html>"""


# Public route


@embeds_router.get("/{embed_id}", response_class=HTMLResponse)
def get_embed_document(embed_id: str, request: Request, db: Session = Depends(get_db)):
    """Serve the visualiser as a sandboxed document for the iframe to load."""
    embed = db.query(Embed).filter(Embed.id == embed_id).first()
    if not embed:
        # HTML rather than JSON — this renders inside a frame, not a console.
        return HTMLResponse(
            content=MISSING_EMBED_HTML, status_code=404, headers=DOCUMENT_HEADERS
        )

    etag = f'"{embed.content_hash}"'
    headers = {**DOCUMENT_HEADERS, "ETag": etag}

    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)

    return HTMLResponse(content=embed.html, headers=headers)


# Protected routes


@embeds_router.post("/", response_model=EmbedSummary, status_code=201)
async def create_embed(
    post_id: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    if not db.query(BlogPost.id).filter(BlogPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")

    html, content_hash, byte_size = await read_embed_file(file)

    embed = Embed(
        post_id=post_id,
        title=title,
        html=html,
        content_hash=content_hash,
        byte_size=byte_size,
    )
    db.add(embed)
    db.commit()
    db.refresh(embed)

    return embed


@embeds_router.put("/{embed_id}", response_model=EmbedSummary)
async def replace_embed(
    embed_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    """Replace in place. The id — and every post referencing it — is untouched."""
    embed = db.query(Embed).filter(Embed.id == embed_id).first()
    if not embed:
        raise HTTPException(status_code=404, detail="Embed not found")

    embed.html, embed.content_hash, embed.byte_size = await read_embed_file(file)

    db.commit()
    db.refresh(embed)

    return embed


@embeds_router.get("/", response_model=List[EmbedSummary])
def list_post_embeds(
    post_id: str,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    return (
        db.query(Embed)
        .filter(Embed.post_id == post_id)
        .order_by(Embed.created_at.desc())
        .all()
    )


@embeds_router.delete("/{embed_id}", status_code=204)
def delete_embed(
    embed_id: str,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    embed = db.query(Embed).filter(Embed.id == embed_id).first()
    if not embed:
        raise HTTPException(status_code=404, detail="Embed not found")

    db.delete(embed)
    db.commit()
