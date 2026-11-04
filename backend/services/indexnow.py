import logging
from urllib.parse import urlparse

import httpx

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"


def ping(urls: list[str]) -> None:
    """Tell Bing and the other IndexNow engines these URLs changed. Off when no key is set."""
    if not settings.INDEXNOW_KEY or not urls:
        return
    site = settings.SITE_URL.rstrip("/")
    try:
        httpx.post(
            INDEXNOW_ENDPOINT,
            json={
                "host": urlparse(site).netloc,
                "key": settings.INDEXNOW_KEY,
                "keyLocation": f"{site}/{settings.INDEXNOW_KEY}.txt",
                "urlList": urls,
            },
            timeout=10,
        ).raise_for_status()
    except httpx.HTTPError as exc:
        # Best effort: crawlers still find the change through the sitemap.
        logger.warning("IndexNow ping failed: %s", exc)
