from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.post import BlogPost
from models.subscriber import Subscriber
from schemas.post import PostInput, PostOutput, PostSummary
from schemas.settings import PrintOutput, PrintRequest
from middleware.auth import require_authentication
from services import post as post_service
from services.cloudinary_urls import is_own_cloudinary_url
from services import prints as print_service
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
    limit: int | None = None,
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

    # Newest first by publish date; drafts (no publish date yet) by when they were started
    query = query.order_by(func.coalesce(BlogPost.published_at, BlogPost.created_at).desc())

    posts = query.offset(offset).limit(limit).all()
    return posts


@posts_router.get("/series/{series_slug}", response_model=List[PostSummary])
def list_series_posts(series_slug: str, db: Session = Depends(get_db)):
    """Published posts in a series, ordered by their explicit reading order."""
    return (
        db.query(BlogPost)
        .filter(BlogPost.is_published, BlogPost.series == series_slug)
        .order_by(BlogPost.series_order.asc())
        .all()
    )


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


def _check_print_url(print_url: str | None, current: str | None = None) -> None:
    # Checked on admin writes only: PostOutput inherits PostInput, so a schema validator would also run on reads.
    if print_url and print_url != current and not is_own_cloudinary_url(print_url):
        raise HTTPException(status_code=422, detail="print_url must be an image on this blog's Cloudinary")


@posts_router.post("/", response_model=PostOutput, status_code=201)
def create_post(
    post_data: PostInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    _check_print_url(post_data.print_url)
    new_post = post_service.create_post(db, post_data)

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

    _check_print_url(post_data.print_url, post.print_url)
    was_published = post.is_published
    post = post_service.update_post(db, post, post_data)

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


@posts_router.post("/{post_id}/print", response_model=PrintOutput)
def generate_post_print(
    post_id: str,
    body: PrintRequest,
    db: Session = Depends(get_db),
    auth=Depends(require_authentication),
):
    """Renders a cover from one of the post's images for preview. The post stores it when saved."""
    # A plain def: FastAPI runs the download and the CPU-bound render in its threadpool.
    if db.get(BlogPost, post_id) is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.close()  # don't hold a pooled connection through the download, render and upload
    return PrintOutput(print_url=print_service.generate_print(post_id, body.source_url, body.invert))
