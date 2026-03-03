from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List
import re

from database import get_db
from models.post import BlogPost
from models.subscriber import Subscriber
from schemas.post import PostInput, PostOutput, PostSummary
from middleware.auth import require_authentication
from services.slug import generate_slug
from services.email import send_new_post_notification
from config import get_settings

settings = get_settings()


def trigger_post_notifications(
    post: BlogPost, background_tasks: BackgroundTasks, db: Session
):
    """
    Helper to fire off notifications in the background if there are subscribers.
    """
    subscribers = db.query(Subscriber.email).filter(Subscriber.confirmed).all()
    emails = [row[0] for row in subscribers]

    if emails:
        post_url = f"{settings.SITE_URL}/blog/{post.slug}"
        background_tasks.add_task(
            send_new_post_notification,
            post_title=post.title,
            post_excerpt=post.excerpt,
            post_url=post_url,
            cover_image=post.cover_image,
            subscribers=emails,
        )


posts_router = APIRouter(prefix="/posts", tags=["Posts"])


# Public Routes


@posts_router.get("/", response_model=List[PostSummary])
def list_posts(
    offset: int = 0,
    limit: int = 10,
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    request: Request = None,
):
    # Drafts are only visible to authenticated admins
    if include_drafts:
        token = request.cookies.get("access_token") if request else None
        if not token:
            raise HTTPException(
                status_code=403, detail="Authentication required to view drafts"
            )
        from services.auth import verify_token

        if verify_token(token) is None:
            raise HTTPException(
                status_code=403, detail="Authentication required to view drafts"
            )

    query = db.query(BlogPost)

    if not include_drafts:
        query = query.filter(BlogPost.is_published)

    posts = query.offset(offset).limit(limit).all()
    return posts


@posts_router.get("/id/{post_id}", response_model=PostOutput)
def get_post_by_id(post_id: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@posts_router.get("/{slug}", response_model=PostOutput)
def get_single_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# Protected Routes


@posts_router.post("/", response_model=PostOutput, status_code=201)
def create_post(
    post_data: PostInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    slug = generate_slug(post_data.title, db)

    # Strip HTML tags before calculating reading time (~200 wpm)
    plain_text = re.sub(r"<[^>]+>", "", post_data.content)
    word_count = len(plain_text.split())
    reading_time = max(1, round(word_count / 200))

    new_post = BlogPost(**post_data.model_dump(), slug=slug, reading_time=reading_time)

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # Fire notification if published immediately
    if new_post.is_published:
        trigger_post_notifications(new_post, background_tasks, db)

    return new_post


@posts_router.put("/{post_id}", response_model=PostOutput)
def update_post(
    post_id: str,
    post_data: PostInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    # Find the post
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Capture original state to check for publish transition
    original_title = post.title
    was_published = post.is_published

    # Update fields
    for field, value in post_data.model_dump().items():
        setattr(post, field, value)

    # Regenerate slug if title changed
    if post.title != original_title:
        post.slug = generate_slug(post.title, db)

    # Recalculate reading time (strip HTML tags first)
    plain_text = re.sub(r"<[^>]+>", "", post.content)
    post.reading_time = max(1, round(len(plain_text.split()) / 200))

    # Save
    db.commit()
    db.refresh(post)

    # Fire notification if transitioning from Draft -> Published
    if post.is_published and not was_published:
        trigger_post_notifications(post, background_tasks, db)

    return post


@posts_router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: str, db: Session = Depends(get_db), auth=Depends(require_authentication)
):
    # Find the post
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Delete it
    db.delete(post)
    db.commit()
