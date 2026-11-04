import os
from datetime import datetime, timedelta

from alembic import command
from alembic.config import Config
from sqlalchemy import text

from database import engine, SessionLocal
from models.post import BlogPost


def post(admin_client, title, **fields):
    res = admin_client.post("/api/posts/", json={"title": title, "content": "<p>x</p>", **fields})
    assert res.status_code == 201, res.text
    return res.json()


def update(admin_client, created, **fields):
    body = {"title": created["title"], "content": "<p>x</p>", **fields}
    res = admin_client.put(f"/api/posts/{created['id']}", json=body)
    assert res.status_code == 200, res.text
    return res.json()


def test_a_draft_has_no_publish_date_until_published(admin_client):
    draft = post(admin_client, "Draft")
    assert draft["published_at"] is None

    published = update(admin_client, draft, is_published=True)
    assert published["published_at"] is not None


def test_publish_date_is_kept_through_edits_and_unpublishing(admin_client):
    first = post(admin_client, "Live", is_published=True)["published_at"]
    created = admin_client.get("/api/posts/live").json()

    assert update(admin_client, created, is_published=True)["published_at"] == first
    assert update(admin_client, created, is_published=False)["published_at"] == first
    assert update(admin_client, created, is_published=True)["published_at"] == first


def test_list_is_ordered_by_publish_date_not_draft_date(admin_client):
    old_draft = post(admin_client, "Started long ago")
    with SessionLocal() as db:
        db.get(BlogPost, old_draft["id"]).created_at = datetime.utcnow() - timedelta(days=30)
        db.commit()
    post(admin_client, "Published yesterday", is_published=True)
    with SessionLocal() as db:
        db.query(BlogPost).filter(BlogPost.title == "Published yesterday").one().published_at = datetime.utcnow() - timedelta(days=1)
        db.commit()

    update(admin_client, old_draft, is_published=True)

    titles = [p["title"] for p in admin_client.get("/api/posts/").json()]
    assert titles == ["Started long ago", "Published yesterday"]


def test_migration_backfills_published_posts_only():
    config = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    command.downgrade(config, "d4e5f6a7b8c9")
    with engine.begin() as conn:
        conn.execute(text(
            "INSERT INTO blogs (id, title, slug, content, is_published, created_at, updated_at, tags) VALUES "
            "('a', 'A', 'a', 'x', true, '2026-01-02', '2026-01-03', '{}'),"
            "('b', 'B', 'b', 'x', false, '2026-01-02', '2026-01-03', '{}')"
        ))
    command.upgrade(config, "head")
    with engine.begin() as conn:
        rows = dict(conn.execute(text("SELECT id, published_at FROM blogs ORDER BY id")).all())
    assert rows == {"a": datetime(2026, 1, 2), "b": None}
