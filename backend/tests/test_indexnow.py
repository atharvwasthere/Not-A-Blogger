import pytest

from services import indexnow


@pytest.fixture
def pings(monkeypatch):
    sent = []
    monkeypatch.setattr(indexnow.settings, "INDEXNOW_KEY", "testkey")
    monkeypatch.setattr(indexnow.httpx, "post", lambda url, json, timeout: sent.append(json) or FakeResponse())
    return sent


class FakeResponse:
    def raise_for_status(self):
        pass


def write(admin_client, title, **fields):
    res = admin_client.post("/api/posts/", json={"title": title, "content": "<p>x</p>", **fields})
    assert res.status_code == 201, res.text
    return res.json()


def test_publishing_editing_and_deleting_a_public_post_pings(admin_client, pings):
    live = write(admin_client, "Live", is_published=True)
    admin_client.put(f"/api/posts/{live['id']}", json={"title": "Live", "content": "<p>y</p>", "is_published": True})
    admin_client.delete(f"/api/posts/{live['id']}")

    assert [p["urlList"] for p in pings] == [["http://localhost:3000/blog/live"]] * 3
    assert pings[0]["keyLocation"] == "http://localhost:3000/testkey.txt"


def test_drafts_never_ping(admin_client, pings):
    draft = write(admin_client, "Draft")
    admin_client.put(f"/api/posts/{draft['id']}", json={"title": "Draft", "content": "<p>y</p>"})
    admin_client.delete(f"/api/posts/{draft['id']}")

    assert pings == []


def test_without_a_key_nothing_is_sent(admin_client, pings, monkeypatch):
    monkeypatch.setattr(indexnow.settings, "INDEXNOW_KEY", None)
    write(admin_client, "Live", is_published=True)

    assert pings == []
