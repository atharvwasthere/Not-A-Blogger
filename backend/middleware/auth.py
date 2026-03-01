from fastapi import HTTPException, Request
from services.auth import verify_token


def require_authentication(request: Request):
    print(f"DEBUG: Cookies received: {request.cookies.keys()}")
    token = request.cookies.get("access_token")
    print(f"DEBUG: Token extracted: {token}")

    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    return payload
