"""Generates a post's newspaper cover from one of its own images."""

import io

import cloudinary.uploader
import httpx
from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError

from config import get_settings
from services.halftone import Invert, render_halftone

DOWNLOAD_TIMEOUT_SECONDS = 10
MAX_SOURCE_BYTES = 15 * 1024 * 1024
PRINTS_FOLDER = "blog_posts/prints"


def check_source_url(source_url: str) -> None:
    """Only fetch our own images, so the server cannot be pointed at arbitrary URLs."""
    cloud = get_settings().CLOUDINARY_CLOUD_NAME
    if not cloud or not source_url.startswith(f"https://res.cloudinary.com/{cloud}/"):
        raise HTTPException(status_code=400, detail="The source must be an image uploaded to this blog's Cloudinary")


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
        image.load()
        return image
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError) as error:
        raise HTTPException(status_code=400, detail="The source is not an image Pillow can read") from error


def upload_print(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    result = cloudinary.uploader.upload(buffer.getvalue(), resource_type="image", folder=PRINTS_FOLDER, format="png")
    return result["secure_url"]


def generate_print(source_url: str, invert: Invert) -> str:
    check_source_url(source_url)
    image = open_image(download_source(source_url))
    return upload_print(render_halftone(image, invert))
