from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from database import BaseModel
from uuid import uuid4


class Subscriber(BaseModel):
    __tablename__ = "subscribers"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    confirmed = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    unsubscribed_at = Column(DateTime, nullable=True)
