def test_get_is_public_and_defaults_to_covers_on(client):
    res = client.get("/api/settings")
    assert res.status_code == 200
    assert res.json() == {"covers_enabled": True}


def test_put_needs_an_admin(client):
    assert client.put("/api/settings", json={"covers_enabled": False}).status_code == 401


def test_admin_can_switch_covers_off_and_on(admin_client):
    assert admin_client.put("/api/settings", json={"covers_enabled": False}).json() == {"covers_enabled": False}
    assert admin_client.get("/api/settings").json() == {"covers_enabled": False}
    assert admin_client.put("/api/settings", json={"covers_enabled": True}).json() == {"covers_enabled": True}


def test_migration_seeds_covers_on():
    # The row the migration inserted is truncated between tests, so check the migration itself.
    import os
    from alembic import command
    from alembic.config import Config
    from sqlalchemy import text
    from database import engine

    config = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    command.downgrade(config, "d5e6f7a8b9c0")
    command.upgrade(config, "head")
    with engine.connect() as conn:
        assert conn.execute(text("SELECT value FROM site_settings WHERE key = 'covers_enabled'")).scalar() is True
