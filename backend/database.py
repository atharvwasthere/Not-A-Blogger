from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import get_settings


db_config = get_settings()
DATABASE_URL = db_config.DATABASE_URL


engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseModel = declarative_base()


def get_db():
    session = SessionLocal()
    try:
        yield session  # returns but keeps function alive
    finally:
        session.close()
