from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List


########################
#   Creating a post    #
# ######################


class PostInput(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    content: str = Field(..., min_length=2)
    excerpt: Optional[str] = Field(None, min_length=2)
    cover_image: Optional[str] = Field(None, min_length=2)
    icon_url: Optional[str] = Field(None, min_length=2)
    is_published: bool = Field(False)
    seo_title: Optional[str] = Field(None, min_length=2, max_length=200)
    seo_description: Optional[str] = Field(None, min_length=2, max_length=300)
    tags: List[str] = Field(default_factory=list)
    series: Optional[str] = Field(None, max_length=100)
    series_order: Optional[int] = Field(None, ge=0)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: List[str]) -> List[str]:
        # Lowercase, trim, drop empties, dedupe (preserve first-seen order)
        # so "Go", " go " and "go" collapse to a single sidebar topic.
        seen: set[str] = set()
        cleaned: List[str] = []
        for raw in value or []:
            tag = raw.strip().lower()
            if tag and tag not in seen:
                seen.add(tag)
                cleaned.append(tag)
        return cleaned


########################
#   Returning a post   #
# ######################


class PostSummary(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    icon_url: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    reading_time: Optional[int] = 1
    tags: List[str] = []
    series: Optional[str] = None
    series_order: Optional[int] = None

    class Config:
        from_attributes = True


class PostIndexItem(BaseModel):
    """Lightweight payload for the ⌘K command palette — title + tags only."""

    slug: str
    title: str
    tags: List[str] = []

    class Config:
        from_attributes = True


class PostOutput(PostInput):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime
    reading_time: Optional[int] = 1

    class Config:
        from_attributes = True  # Converts database objects to JSON


class PostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    icon_url: Optional[str] = None
    is_published: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class Post(PostBase):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime
    reading_time: Optional[int] = 1

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: List[Post]
    total: int

    class Config:
        from_attributes = True  # Converts database objects to JSON
