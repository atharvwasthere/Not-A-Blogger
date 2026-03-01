"""
Reads .env provide settings for the app acts as mediator
"""

import os
from dotenv import load_dotenv

load_dotenv()


class AppSettings:
    PORT = os.getenv("PORT")
    ENVIRONMENT = os.getenv("ENVIRONMENT")
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
    JWT_EXPIRES_IN = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "7"))
    USERNAME = os.getenv("ADMIN_USERNAME")
    PASSWORD = os.getenv("ADMIN_PASSWORD")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
    SITE_URL = os.getenv("SITE_URL", "http://localhost:3000")


def get_settings():
    return AppSettings()
