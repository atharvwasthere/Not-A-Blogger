from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import require_authentication
from schemas.settings import SiteSettings
from services import settings as settings_service

settings_router = APIRouter(prefix="/settings", tags=["Settings"])


@settings_router.get("", response_model=SiteSettings)
def read_settings(db: Session = Depends(get_db)):
    return settings_service.get_settings(db)


@settings_router.put("", response_model=SiteSettings)
def write_settings(body: SiteSettings, db: Session = Depends(get_db), auth=Depends(require_authentication)):
    return settings_service.update_settings(db, body)
