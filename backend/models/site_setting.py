from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB

from database import BaseModel


class SiteSetting(BaseModel):
    """Site-wide switches, one row per key (e.g. covers_enabled)."""

    __tablename__ = "site_settings"

    key = Column(String, primary_key=True)
    value = Column(JSONB, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
