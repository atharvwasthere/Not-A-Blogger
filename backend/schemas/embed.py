from pydantic import BaseModel
from datetime import datetime


class EmbedSummary(BaseModel):
    """Embed metadata. Never carries the html body — that is served as a document."""

    id: str
    post_id: str
    title: str
    byte_size: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
