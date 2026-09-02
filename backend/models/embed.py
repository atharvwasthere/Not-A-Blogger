from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from datetime import datetime
from database import BaseModel
from uuid import uuid4


class Embed(BaseModel):
    __tablename__ = "embeds"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    # Ownership only — whether the post body still references this embed lives in
    # opaque HTML and is not knowable here.
    post_id = Column(
        String, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(200), nullable=False)
    html = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False)
    byte_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
