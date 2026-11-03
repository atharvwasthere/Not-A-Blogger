import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Request, Response, Depends
from fastapi.responses import RedirectResponse
from services.auth import generate_access_token, fetch_github_user_id
from middleware.auth import require_authentication
from config import get_settings

config = get_settings()

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

STATE_COOKIE = "github_oauth_state"
STATE_COOKIE_PATH = "/api/auth/github"
GITHUB_CALLBACK_URL = f"{config.API_URL}/api/auth/github/callback"


def admin_cookie_flags() -> dict:
    is_production = config.ENVIRONMENT == "production"
    return {
        "httponly": True,
        "secure": is_production,
        "samesite": "none" if is_production else "lax",
    }


def _return_url(next_path: str) -> str:
    # Only the MCP consent page may be a return target; anything else would be an open redirect.
    if next_path.startswith("/api/oauth/"):
        return f"{config.API_URL}{next_path}"
    return f"{config.SITE_URL}/admin/dashboard"


@auth_router.get("/github/login")
def github_login(next: str = ""):
    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_id": config.GITHUB_CLIENT_ID,
            "redirect_uri": GITHUB_CALLBACK_URL,
            "state": state,
            "allow_signup": "false",
        }
    )
    response = RedirectResponse(f"https://github.com/login/oauth/authorize?{query}")
    response.set_cookie(
        key=STATE_COOKIE,
        value=f"{state} {next}",
        max_age=600,
        httponly=True,
        secure=config.ENVIRONMENT == "production",
        samesite="lax",
        path=STATE_COOKIE_PATH,
    )
    return response


@auth_router.get("/github/callback")
def github_callback(request: Request, code: str = "", state: str = ""):
    expected_state, _, next_path = request.cookies.get(STATE_COOKIE, "").partition(" ")

    user_id = None
    if code and expected_state and secrets.compare_digest(state, expected_state):
        user_id = fetch_github_user_id(code, GITHUB_CALLBACK_URL)

    if not config.GITHUB_ALLOWED_USER_ID or user_id != config.GITHUB_ALLOWED_USER_ID:
        response = RedirectResponse(f"{config.SITE_URL}/admin/login?error=denied")
    else:
        response = RedirectResponse(_return_url(next_path))
        response.set_cookie(
            key="access_token",
            value=generate_access_token(str(user_id)),
            max_age=config.JWT_EXPIRES_IN * 24 * 60 * 60,
            **admin_cookie_flags(),
        )

    response.delete_cookie(STATE_COOKIE, path=STATE_COOKIE_PATH)
    return response


@auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", **admin_cookie_flags())
    return {"message": "Logged out successfully"}


@auth_router.get("/me")
def get_me(auth=Depends(require_authentication)):
    return {"username": auth["sub"]}
