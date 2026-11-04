import os

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from database import engine, SessionLocal
from models.post import BlogPost
from sqlalchemy import select

PAPER = {
    "title": "Scaling Memcache at Facebook",
    "by": "Nishtala et al. · NSDI ’13",
    "url": "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala",
}


def create(admin_client, **fields):
    res = admin_client.post("/api/posts/", json={"title": "The other half", "content": "<p>x</p>", **fields})
    return res


def test_based_on_round_trips(admin_client):
    res = create(admin_client, based_on=PAPER, is_published=True)
    assert res.status_code == 201, res.text
    assert res.json()["based_on"] == PAPER

    slug = res.json()["slug"]
    assert admin_client.get(f"/api/posts/{slug}").json()["based_on"] == PAPER
    listed = admin_client.get("/api/posts/").json()
    assert listed[0]["based_on"] == PAPER


def test_based_on_is_optional_and_null_clears_it(admin_client):
    post = create(admin_client, based_on=PAPER).json()
    assert create(admin_client).json()["based_on"] is None

    cleared = admin_client.put(
        f"/api/posts/{post['id']}", json={"title": post["title"], "content": post["content"], "based_on": None}
    )
    assert cleared.status_code == 200
    assert cleared.json()["based_on"] is None
    # Stored as SQL NULL, not a JSON null.
    with SessionLocal() as db:
        assert db.execute(select(BlogPost.id).where(BlogPost.id == post["id"], BlogPost.based_on.is_(None))).scalar()


@pytest.mark.parametrize("url", ["javascript:alert(1)", "ftp://example.com/paper.pdf", "not a url"])
def test_based_on_url_must_be_http(admin_client, url):
    assert create(admin_client, based_on={**PAPER, "url": url}).status_code == 422


@pytest.mark.parametrize("title", ["", "x", "y" * 301])
def test_based_on_title_length(admin_client, title):
    assert create(admin_client, based_on={**PAPER, "title": title}).status_code == 422


def test_based_on_migration_downgrades_and_upgrades():
    config = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    columns = lambda: {c["name"] for c in inspect(engine).get_columns("blogs")}  # noqa: E731

    command.downgrade(config, "c3d4e5f6a7b8")
    assert "based_on" not in columns()
    command.upgrade(config, "head")
    assert "based_on" in columns()
