def test_admin_create_and_update_still_derive_slug_and_reading_time(admin_client):
    words = " ".join(["word"] * 450)
    created = admin_client.post("/api/posts/", json={"title": "First title", "content": f"<p>{words}</p>"})
    assert created.status_code == 201, created.text
    assert created.json()["slug"] == "first-title"
    assert created.json()["reading_time"] == 2

    post_id = created.json()["id"]
    updated = admin_client.put(f"/api/posts/{post_id}", json={"title": "Second title", "content": "<p>short</p>"})
    assert updated.status_code == 200, updated.text
    assert updated.json()["slug"] == "second-title"
    assert updated.json()["reading_time"] == 1


def test_writes_need_an_admin_session(client):
    assert client.post("/api/posts/", json={"title": "Nope", "content": "<p>x</p>"}).status_code == 401
