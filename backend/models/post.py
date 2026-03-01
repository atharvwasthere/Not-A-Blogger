from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer
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
    seo_title = Column(String(200))
    seo_description = Column(String(300))
    reading_time = Column(Integer, default=1)
    icon_url = Column(String(500))
