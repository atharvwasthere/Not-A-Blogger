from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class SubscriberCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class SubscriberUnsubscribe(BaseModel):
    email: EmailStr


class SubscriberResponse(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    confirmed: bool
    subscribed_at: datetime

    class Config:
        from_attributes = True
