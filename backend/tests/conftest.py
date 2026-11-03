import os

# Settings are read at import time, so the environment must be in place first.
os.environ.update(
    DATABASE_URL=os.getenv("TEST_DATABASE_URL", "postgresql://postgres:test@localhost:55432/nab_test"),
    JWT_SECRET="test-secret",
    JWT_ALGORITHM="HS256",
    ENVIRONMENT="test",
    ALLOWED_ORIGINS="http://localhost:3000",
    SITE_URL="http://localhost:3000",
    API_URL="http://localhost:8000",
    GITHUB_CLIENT_ID="test-client",
    GITHUB_CLIENT_SECRET="test-secret",
    GITHUB_ALLOWED_USER_ID="132380045",
)

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import text

from database import engine
from main import app
from services.auth import generate_access_token

API_URL = os.environ["API_URL"]
ALLOWED_USER_ID = 132380045


@pytest.fixture(scope="session", autouse=True)
def schema():
    command.upgrade(Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini")), "head")


@pytest.fixture(autouse=True)
def clean_tables():
    yield
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE oauth_clients, oauth_codes, oauth_tokens, embeds, blogs, site_settings CASCADE"))


@pytest.fixture(scope="session")
def app_client():
    # One lifespan for the whole run: the MCP session manager can only be started once.
    with TestClient(app, base_url=API_URL) as client:
        yield client


@pytest.fixture
def client(app_client):
    app_client.cookies.clear()
    return app_client


@pytest.fixture
def admin_client(client):
    client.cookies.set("access_token", generate_access_token(str(ALLOWED_USER_ID)))
    return client
