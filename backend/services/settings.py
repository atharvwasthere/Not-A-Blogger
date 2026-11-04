from sqlalchemy.orm import Session

from models.site_setting import SiteSetting
from schemas.settings import SiteSettings


def get_settings(db: Session) -> SiteSettings:
    stored = {row.key: row.value for row in db.query(SiteSetting).all()}
    return SiteSettings(**{k: v for k, v in stored.items() if k in SiteSettings.model_fields})


def update_settings(db: Session, settings: SiteSettings) -> SiteSettings:
    for key, value in settings.model_dump().items():
        row = db.get(SiteSetting, key)
        if row:
            row.value = value
        else:
            db.add(SiteSetting(key=key, value=value))
    db.commit()
    return get_settings(db)
