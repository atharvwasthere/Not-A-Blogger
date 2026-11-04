from config import get_settings


def is_own_cloudinary_url(url: str) -> bool:
    """True for assets on this blog's Cloudinary account, the only images the server will fetch or store."""
    cloud = get_settings().CLOUDINARY_CLOUD_NAME
    return bool(cloud) and url.startswith(f"https://res.cloudinary.com/{cloud}/")
