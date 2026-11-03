import re
from sqlalchemy.orm import Session

from models.post import BlogPost
from schemas.post import PostInput
from services.slug import generate_slug


def _reading_time(content: str) -> int:
    # Strip HTML tags before counting words (~200 wpm)
    plain_text = re.sub(r"<[^>]+>", "", content)
    return max(1, round(len(plain_text.split()) / 200))


def create_post(db: Session, post_data: PostInput) -> BlogPost:
    post = BlogPost(
        **post_data.model_dump(),
        slug=generate_slug(post_data.title, db),
        reading_time=_reading_time(post_data.content),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def update_post(db: Session, post: BlogPost, post_data: PostInput) -> BlogPost:
    original_title = post.title

    for field, value in post_data.model_dump().items():
        setattr(post, field, value)

    if post.title != original_title:
        post.slug = generate_slug(post.title, db)
    post.reading_time = _reading_time(post.content)

    db.commit()
    db.refresh(post)
    return post
