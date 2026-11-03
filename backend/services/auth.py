"""
- create_jwt_token()
- verify_token
- fetch_github_user_id()
"""

from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
import httpx
from config import get_settings

config = get_settings()


def generate_access_token(user_id: str) -> str:
    expiry = datetime.utcnow() + timedelta(days=config.JWT_EXPIRES_IN)

    token_data = {"sub": user_id, "exp": expiry, "iat": datetime.utcnow()}

    encoded_jwt = jwt.encode(
        token_data, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
    except Exception as e:
        return None


def fetch_github_user_id(code: str, redirect_uri: str) -> Optional[int]:
    """Exchange a GitHub OAuth code and return the numeric id of the account that signed in."""
    token_res = httpx.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": config.GITHUB_CLIENT_ID,
            "client_secret": config.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
        },
        headers={"Accept": "application/json"},
        timeout=10,
    )
    access_token = token_res.json().get("access_token")
    if not access_token:
        return None

    user_res = httpx.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
        },
        timeout=10,
    )
    if user_res.status_code != 200:
        return None
    return user_res.json().get("id")
