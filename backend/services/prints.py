"""Generates a post's newspaper cover from one of its own images."""

import hashlib
import io
import re

import cloudinary.uploader
import httpx
from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError

from services.cloudinary_urls import is_own_cloudinary_url
from services.halftone import Invert, render_halftone

DOWNLOAD_TIMEOUT_SECONDS = 10
MAX_SOURCE_BYTES = 15 * 1024 * 1024
MAX_SOURCE_PIXELS = 40_000_000  # ~160 MB decoded as RGBA; refused before decoding
UPLOAD_TIMEOUT_SECONDS = 30
PRINTS_FOLDER = "blog_posts/prints"


def check_source_url(source_url: str) -> None:
    """Only fetch our own images, so the server cannot be pointed at arbitrary URLs."""
    if not is_own_cloudinary_url(source_url):
        raise HTTPException(status_code=400, detail="The source must be an image uploaded to this blog's Cloudinary")


def raster_url(source_url: str) -> str:
    """Pillow cannot read SVG, so ask Cloudinary for a PNG rendering of it."""
    if not source_url.lower().split("?")[0].endswith(".svg"):
        return source_url
    return re.sub(r"/image/upload/", "/image/upload/f_png/", source_url, count=1)


def download_source(source_url: str) -> bytes:
    try:
        # No redirects: the allow-list above must hold for the bytes actually fetched.
        with httpx.stream("GET", source_url, timeout=DOWNLOAD_TIMEOUT_SECONDS, follow_redirects=False) as response:
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Could not fetch the source image ({response.status_code})")
            data = bytearray()
            for chunk in response.iter_bytes():
                data.extend(chunk)
                if len(data) > MAX_SOURCE_BYTES:
                    raise HTTPException(status_code=400, detail="The source image is larger than 15 MB")
            return bytes(data)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=400, detail=f"Could not fetch the source image: {error}") from error


def open_image(data: bytes) -> Image.Image:
    # Pillow's decompression-bomb guard (Image.MAX_IMAGE_PIXELS) stays on.
    try:
        image = Image.open(io.BytesIO(data))
        if image.width * image.height > MAX_SOURCE_PIXELS:
            raise HTTPException(status_code=400, detail="The source image is too large; use one under 40 megapixels")
        image.load()
        return image
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError) as error:
        raise HTTPException(status_code=400, detail="The source is not an image Pillow can read") from error


def upload_print(image: Image.Image, public_id: str) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    result = cloudinary.uploader.upload(
        buffer.getvalue(),
        resource_type="image",
        folder=f"{PRINTS_FOLDER}/{public_id.split('/')[0]}",
        public_id=public_id.split("/")[1],
        overwrite=True,
        format="png",
        timeout=UPLOAD_TIMEOUT_SECONDS,
    )
    return result["secure_url"]


def generate_print(post_id: str, source_url: str, invert: Invert) -> str:
    """Renders and uploads a cover; the post stores it only when the author saves."""
    check_source_url(source_url)
    image = open_image(download_source(raster_url(source_url)))
    # One asset per post, source and invert: trying again overwrites instead of piling up.
    key = hashlib.sha1(f"{source_url}|{invert}".encode()).hexdigest()[:12]
    return upload_print(render_halftone(image, invert), f"{post_id}/{key}")
