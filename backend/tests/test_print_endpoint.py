import io

import pytest
from PIL import Image

from config import get_settings
from database import SessionLocal
from models.post import BlogPost
from services import prints

CLOUD = "nab-test-cloud"
SOURCE = f"https://res.cloudinary.com/{CLOUD}/image/upload/v1/blog_posts/treemap.png"
UPLOADED = f"https://res.cloudinary.com/{CLOUD}/image/upload/v2/blog_posts/prints/cover.png"

# The real downloader, before the autouse fixture swaps it for a fake.
real_download_source = prints.download_source


@pytest.fixture(autouse=True)
def fake_cloudinary(monkeypatch):
    """No network: serve a generated PNG as the source and capture the upload."""
    monkeypatch.setattr(get_settings().__class__, "CLOUDINARY_CLOUD_NAME", CLOUD)
    source = io.BytesIO()
    Image.new("RGB", (1200, 800), "white").save(source, format="PNG")
    calls = {"downloaded": [], "uploaded": []}

    def download(url):
        calls["downloaded"].append(url)
        return source.getvalue()

    def upload(image):
        calls["uploaded"].append(image.size)
        return UPLOADED

    monkeypatch.setattr(prints, "download_source", download)
    monkeypatch.setattr(prints, "upload_print", upload)
    return calls


def make_post(**fields):
    with SessionLocal() as db:
        post = BlogPost(title="Bundle", slug="bundle", content="<p>x</p>", **fields)
        db.add(post)
        db.commit()
        return post.id


def test_needs_an_admin(client):
    post_id = make_post()
    assert client.post(f"/api/posts/{post_id}/print", json={"source_url": SOURCE}).status_code == 401


@pytest.mark.parametrize(
    "url",
    [
        "https://example.com/image.png",
        "http://res.cloudinary.com/nab-test-cloud/image/upload/x.png",
        "https://res.cloudinary.com/someone-else/image/upload/x.png",
        "https://res.cloudinary.com.evil.example/nab-test-cloud/x.png",
        "http://169.254.169.254/latest/meta-data/",
    ],
)
def test_rejects_urls_outside_our_cloud(admin_client, fake_cloudinary, url):
    post_id = make_post()
    res = admin_client.post(f"/api/posts/{post_id}/print", json={"source_url": url})
    assert res.status_code == 400
    assert fake_cloudinary["downloaded"] == []


def test_stores_print_url_and_leaves_show_print_alone(admin_client, fake_cloudinary):
    post_id = make_post(show_print=False)
    res = admin_client.post(f"/api/posts/{post_id}/print", json={"source_url": SOURCE, "invert": "never"})

    assert res.status_code == 200, res.text
    assert res.json() == {"print_url": UPLOADED}
    assert fake_cloudinary["uploaded"] == [(960, 600)]
    with SessionLocal() as db:
        post = db.get(BlogPost, post_id)
        assert post.print_url == UPLOADED
        assert post.show_print is False


def test_regenerating_keeps_a_cover_that_is_on(admin_client):
    post_id = make_post(show_print=True)
    admin_client.post(f"/api/posts/{post_id}/print", json={"source_url": SOURCE})
    with SessionLocal() as db:
        assert db.get(BlogPost, post_id).show_print is True


def test_unknown_post_is_404(admin_client):
    assert admin_client.post("/api/posts/nope/print", json={"source_url": SOURCE}).status_code == 404


def test_print_url_cannot_be_written_through_the_post_api(admin_client):
    res = admin_client.post(
        "/api/posts/", json={"title": "Sneaky", "content": "<p>x</p>", "print_url": "https://evil.example/x.png"}
    )
    assert res.status_code == 201
    assert res.json()["print_url"] is None


def test_show_print_round_trips(admin_client):
    created = admin_client.post("/api/posts/", json={"title": "Cover", "content": "<p>x</p>", "show_print": True}).json()
    assert created["show_print"] is True
    assert admin_client.get("/api/posts/?include_drafts=true").json()[0]["show_print"] is True


def test_oversized_download_is_refused(monkeypatch):
    class Response:
        status_code = 200

        def iter_bytes(self):
            while True:
                yield b"x" * (1024 * 1024)

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    monkeypatch.setattr(prints.httpx, "stream", lambda *a, **k: Response())
    with pytest.raises(Exception) as error:
        real_download_source(SOURCE)
    assert "15 MB" in str(error.value.detail)


def test_non_image_is_refused():
    with pytest.raises(Exception) as error:
        prints.open_image(b"<html>not an image</html>")
    assert error.value.status_code == 400
