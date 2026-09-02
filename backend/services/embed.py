import hashlib
from fastapi import HTTPException, UploadFile

MAX_EMBED_BYTES = 512 * 1024


async def read_embed_file(file: UploadFile) -> tuple[str, str, int]:
    """Validate an uploaded visualiser, returning (html, sha256, byte_size)."""
    filename = file.filename or ""
    if not filename.lower().endswith(".html") or file.content_type != "text/html":
        raise HTTPException(
            status_code=400, detail="An embed must be a single .html file"
        )

    contents = await file.read()

    if len(contents) > MAX_EMBED_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"Embed is {(len(contents) + 1023) // 1024} KB; "
                f"the limit is {MAX_EMBED_BYTES // 1024} KB. "
                "Reference images as URLs instead of inlining them."
            ),
        )

    try:
        html = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Embed must be UTF-8 encoded")

    return html, hashlib.sha256(contents).hexdigest(), len(contents)
