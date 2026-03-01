from pydantic import BaseModel, Field
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
    is_published: bool = Field(False)
    seo_title: Optional[str] = Field(None, min_length=2, max_length=200)
    seo_description: Optional[str] = Field(None, min_length=2, max_length=300)


########################
#   Returning a post   #
# ######################


class PostSummary(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    reading_time: Optional[int] = 1

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
