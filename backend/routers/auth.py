from fastapi import APIRouter, HTTPException, Response, Depends
from schemas.auth import LoginRequest, LoginResponse
from services.auth import (
    validate_admin_credentials,
    generate_access_token,
)
from middleware.auth import require_authentication
from config import get_settings

config = get_settings()

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/login", response_model=LoginResponse)
def admin_login(response: Response, credentials: LoginRequest):
    if not validate_admin_credentials(credentials.username, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = generate_access_token(credentials.username)

    is_production = config.ENVIRONMENT == "production"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=config.JWT_EXPIRES_IN * 24 * 60 * 60,
    )

    return LoginResponse(access_token=access_token, token_type="bearer")


@auth_router.post("/logout")
def logout(response: Response):
    is_production = config.ENVIRONMENT == "production"
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
    )
    return {"message": "Logged out successfully"}


@auth_router.get("/me")
def get_me(auth=Depends(require_authentication)):
    return {"username": auth["sub"]}
