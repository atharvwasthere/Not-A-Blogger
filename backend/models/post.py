from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, false as sql_false
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from datetime import datetime
from database import BaseModel
from uuid import uuid4


class BlogPost(BaseModel):
    __tablename__ = "blogs"

    # Define columns
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)  # Nullable by default
    cover_image = Column(String(500))
    is_published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)  # set on first publish, kept if unpublished
    seo_title = Column(String(200))
    seo_description = Column(String(300))
    reading_time = Column(Integer, default=1)
    icon_url = Column(String(500))
    # Discovery / curation
    tags = Column(ARRAY(String), nullable=False, server_default="{}")
    series = Column(String(100), nullable=True, index=True)
    series_order = Column(Integer, nullable=True)
    # The source a paper-series post is built around: {title, by, url}
    based_on = Column(JSONB(none_as_null=True), nullable=True)
    # Newspaper cover: a halftone print of an image from the post, and whether it shows.
    print_url = Column(String(500), nullable=True)
    show_print = Column(Boolean, nullable=False, default=False, server_default=sql_false())
