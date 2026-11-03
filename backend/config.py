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
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    JWT_EXPIRES_IN = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "7"))
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_ALLOWED_USER_ID = int(os.getenv("GITHUB_ALLOWED_USER_ID", "0"))
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
    SITE_URL = os.getenv("SITE_URL", "http://localhost:3000")
    API_URL = os.getenv("API_URL", "http://localhost:8000")


def get_settings():
    return AppSettings()
