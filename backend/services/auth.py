"""
- create_jwt_token()
- verify_token
- validate_admin_credentials()
"""

from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
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


def validate_admin_credentials(username: str, password: str) -> bool:
    return username == config.USERNAME and password == config.PASSWORD
