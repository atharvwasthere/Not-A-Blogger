from urllib.parse import parse_qs, urlparse

import pytest

import routers.auth as auth_routes
from tests.conftest import ALLOWED_USER_ID


@pytest.fixture
def github_user(monkeypatch):
    calls = []

    def set_user(user_id):
        def fake_fetch(code, redirect_uri):
            calls.append((code, redirect_uri))
            return user_id

        monkeypatch.setattr(auth_routes, "fetch_github_user_id", fake_fetch)
        return calls

    return set_user


def start_login(client, next_path=""):
    res = client.get("/api/auth/github/login", params={"next": next_path} if next_path else None, follow_redirects=False)
    assert res.status_code == 307
    return parse_qs(urlparse(res.headers["location"]).query)["state"][0]


def test_login_redirects_to_github_with_state(client):
    res = client.get("/api/auth/github/login", follow_redirects=False)
    location = urlparse(res.headers["location"])
    query = parse_qs(location.query)

    assert location.netloc == "github.com"
    assert query["client_id"] == ["test-client"]
    assert query["redirect_uri"] == ["http://localhost:8000/api/auth/github/callback"]
    assert query["state"][0] in res.headers["set-cookie"]


def test_allowed_account_gets_admin_cookie(client, github_user):
    github_user(ALLOWED_USER_ID)
    state = start_login(client)

    res = client.get("/api/auth/github/callback", params={"code": "abc", "state": state}, follow_redirects=False)

    assert res.headers["location"] == "http://localhost:3000/admin/dashboard"
    assert client.get("/api/auth/me").status_code == 200


def test_other_github_account_is_refused(client, github_user):
    github_user(1)
    state = start_login(client)

    res = client.get("/api/auth/github/callback", params={"code": "abc", "state": state}, follow_redirects=False)

    assert res.headers["location"] == "http://localhost:3000/admin/login?error=denied"
    assert "access_token" not in client.cookies
    assert client.get("/api/auth/me").status_code == 401


def test_state_mismatch_never_reaches_github(client, github_user):
    calls = github_user(ALLOWED_USER_ID)
    start_login(client)

    res = client.get("/api/auth/github/callback", params={"code": "abc", "state": "forged"}, follow_redirects=False)

    assert res.headers["location"].endswith("/admin/login?error=denied")
    assert calls == []
    assert "access_token" not in client.cookies


def test_returns_to_mcp_consent_but_not_elsewhere(client, github_user):
    github_user(ALLOWED_USER_ID)

    state = start_login(client, "/api/oauth/consent?request=xyz")
    res = client.get("/api/auth/github/callback", params={"code": "a", "state": state}, follow_redirects=False)
    assert res.headers["location"] == "http://localhost:8000/api/oauth/consent?request=xyz"

    state = start_login(client, "//evil.example/steal")
    res = client.get("/api/auth/github/callback", params={"code": "a", "state": state}, follow_redirects=False)
    assert res.headers["location"] == "http://localhost:3000/admin/dashboard"


def test_password_login_is_gone(client):
    res = client.post("/api/auth/login", json={"username": "admin", "password": "x"})
    assert res.status_code in (404, 405)
