from fastapi import HTTPException, Request
from services.auth import verify_token


def require_authentication(request: Request):
    token = request.cookies.get("access_token")
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    return payload
