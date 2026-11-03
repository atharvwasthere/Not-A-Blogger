"""OAuth for the MCP endpoint: Claude registers, the admin approves, tokens live in Postgres.

Every grant passes through the admin approval page, and the admin is whoever signed in
with the allowed GitHub account, so a token here always means "the author said yes".
"""

import hashlib
import html
import secrets
from datetime import datetime, timedelta
from urllib.parse import urlencode, urlparse
from uuid import uuid4

import anyio
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from jose import jwt, JWTError
from mcp.server.auth.provider import (
    AccessToken,
    AuthorizationCode,
    AuthorizationParams,
    RefreshToken,
    RegistrationError,
    TokenError,
    construct_redirect_uri,
)
from mcp.shared.auth import OAuthClientInformationFull, OAuthToken as TokenResponse

from config import get_settings
from database import SessionLocal
from middleware.auth import require_authentication
from models.oauth import OAuthClient, OAuthCode, OAuthToken
from services.auth import verify_token

config = get_settings()

ACCESS_TTL = timedelta(hours=1)
REFRESH_TTL = timedelta(days=30)
CODE_TTL = timedelta(minutes=5)
CONSENT_TTL = timedelta(minutes=10)
CONSENT_AUDIENCE = "mcp-consent"

CLAUDE_CALLBACKS = {
    "https://claude.ai/api/mcp/auth_callback",
    "https://claude.com/api/mcp/auth_callback",
}


def is_allowed_redirect(uri: str) -> bool:
    # Claude's hosted callbacks, or a loopback port for Claude Code on this machine.
    if uri in CLAUDE_CALLBACKS:
        return True
    parsed = urlparse(uri)
    return parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1")


def _hash(secret: str) -> str:
    return hashlib.sha256(secret.encode()).hexdigest()


async def _db(work):
    def run():
        with SessionLocal() as db:
            return work(db)

    return await anyio.to_thread.run_sync(run)


def _issue_tokens(db, client_id: str, scopes: list[str], resource: str | None) -> TokenResponse:
    now = datetime.utcnow()
    db.query(OAuthToken).filter(OAuthToken.expires_at < now).delete()

    family = str(uuid4())
    access, refresh = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
    for token, kind, ttl in ((access, "access", ACCESS_TTL), (refresh, "refresh", REFRESH_TTL)):
        db.add(
            OAuthToken(
                token_hash=_hash(token),
                kind=kind,
                family=family,
                client_id=client_id,
                scopes=scopes,
                resource=resource,
                expires_at=now + ttl,
            )
        )
    db.commit()
    return TokenResponse(
        access_token=access,
        token_type="Bearer",
        expires_in=int(ACCESS_TTL.total_seconds()),
        refresh_token=refresh,
        scope=" ".join(scopes) or None,
    )


def _load_token(db, token: str, kind: str, client_id: str | None = None) -> OAuthToken | None:
    row = db.get(OAuthToken, _hash(token))
    if not row or row.kind != kind or row.expires_at < datetime.utcnow():
        return None
    if client_id is not None and row.client_id != client_id:
        return None
    return row


class BlogOAuthProvider:
    async def get_client(self, client_id: str) -> OAuthClientInformationFull | None:
        row = await _db(lambda db: db.get(OAuthClient, client_id))
        return OAuthClientInformationFull.model_validate(row.info) if row else None

    async def register_client(self, client_info: OAuthClientInformationFull) -> None:
        uris = [str(uri) for uri in client_info.redirect_uris or []]
        if not uris or not all(is_allowed_redirect(uri) for uri in uris):
            raise RegistrationError("invalid_redirect_uri", "Only Claude clients may connect")

        def save(db):
            db.add(OAuthClient(client_id=client_info.client_id, info=client_info.model_dump(mode="json")))
            db.commit()

        await _db(save)

    async def authorize(self, client: OAuthClientInformationFull, params: AuthorizationParams) -> str:
        # The pending request rides in a short-lived signed token instead of a table row.
        request = jwt.encode(
            {
                "aud": CONSENT_AUDIENCE,
                "exp": datetime.utcnow() + CONSENT_TTL,
                "client_id": client.client_id,
                "client_name": client.client_name,
                "redirect_uri": str(params.redirect_uri),
                "redirect_uri_provided_explicitly": params.redirect_uri_provided_explicitly,
                "code_challenge": params.code_challenge,
                "state": params.state,
                "scopes": params.scopes or [],
                "resource": params.resource,
            },
            config.JWT_SECRET,
            algorithm=config.JWT_ALGORITHM,
        )
        return f"{config.API_URL}/api/oauth/consent?{urlencode({'request': request})}"

    async def issue_code(self, client_id: str, grant: dict) -> str:
        """Record an approved grant and return the one-time code Claude exchanges for tokens."""
        code = secrets.token_urlsafe(32)

        def save(db):
            now = datetime.utcnow()
            db.query(OAuthCode).filter(OAuthCode.expires_at < now).delete()
            db.add(OAuthCode(code_hash=_hash(code), client_id=client_id, grant=grant, expires_at=now + CODE_TTL))
            db.commit()

        await _db(save)
        return code

    async def load_authorization_code(self, client: OAuthClientInformationFull, authorization_code: str):
        row = await _db(lambda db: db.get(OAuthCode, _hash(authorization_code)))
        if not row or row.client_id != client.client_id:
            return None
        return AuthorizationCode(
            code=authorization_code,
            client_id=row.client_id,
            expires_at=_epoch(row.expires_at),
            **row.grant,
        )

    async def exchange_authorization_code(
        self, client: OAuthClientInformationFull, authorization_code: AuthorizationCode
    ) -> TokenResponse:
        def exchange(db):
            # Deleting first makes the code single-use even under concurrent exchanges.
            deleted = db.query(OAuthCode).filter(OAuthCode.code_hash == _hash(authorization_code.code)).delete()
            if not deleted:
                db.rollback()
                raise TokenError("invalid_grant", "Authorization code already used")
            return _issue_tokens(db, client.client_id, authorization_code.scopes, authorization_code.resource)

        return await _db(exchange)

    async def load_refresh_token(self, client: OAuthClientInformationFull, refresh_token: str):
        def load(db):
            row = _load_token(db, refresh_token, "refresh", client.client_id)
            if not row:
                return None
            return RefreshToken(
                token=refresh_token,
                client_id=row.client_id,
                scopes=row.scopes,
                expires_at=_epoch(row.expires_at),
                resource=row.resource,
            )

        return await _db(load)

    async def exchange_refresh_token(
        self, client: OAuthClientInformationFull, refresh_token: RefreshToken, scopes: list[str]
    ) -> TokenResponse:
        def rotate(db):
            row = _load_token(db, refresh_token.token, "refresh", client.client_id)
            if not row:
                raise TokenError("invalid_grant", "Refresh token is no longer valid")
            db.query(OAuthToken).filter(OAuthToken.family == row.family).delete()
            return _issue_tokens(db, client.client_id, scopes or refresh_token.scopes, refresh_token.resource)

        return await _db(rotate)

    async def load_access_token(self, token: str) -> AccessToken | None:
        def load(db):
            row = _load_token(db, token, "access")
            if not row:
                return None
            return AccessToken(
                token=token,
                client_id=row.client_id,
                scopes=row.scopes,
                expires_at=_epoch(row.expires_at),
                resource=row.resource,
            )

        return await _db(load)

    async def revoke_token(self, token: AccessToken | RefreshToken) -> None:
        def revoke(db):
            row = db.get(OAuthToken, _hash(token.token))
            if row:
                db.query(OAuthToken).filter(OAuthToken.family == row.family).delete()
                db.commit()

        await _db(revoke)


def _epoch(moment: datetime) -> int:
    return int((moment - datetime(1970, 1, 1)).total_seconds())


oauth_provider = BlogOAuthProvider()


# Approval page


oauth_router = APIRouter(prefix="/oauth", tags=["OAuth"])


def _decode_consent(request_token: str) -> dict:
    try:
        return jwt.decode(
            request_token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM], audience=CONSENT_AUDIENCE
        )
    except JWTError:
        raise HTTPException(status_code=400, detail="This sign-in link expired. Start again from Claude.")


CONSENT_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect to Not a Blogger</title>
<style>
body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#18181b;
font:15px/1.6 Inter,system-ui,sans-serif;padding:24px}}
main{{max-width:380px;width:100%}}
h1{{font:400 28px/1.2 "Playfair Display",Georgia,serif;margin:0 0 12px}}
p{{color:#52525b;margin:0 0 8px}}
code{{font:12px ui-monospace,Menlo,monospace;background:#f4f4f5;padding:2px 6px;border-radius:4px}}
form{{display:flex;gap:8px;margin-top:24px}}
button{{flex:1;height:44px;border-radius:8px;font:500 14px Inter,system-ui,sans-serif;cursor:pointer}}
.yes{{background:#18181b;color:#fff;border:0}}.no{{background:#fff;color:#18181b;border:1px solid #e4e4e7}}
</style></head><body><main>
<h1>Let {client} write drafts?</h1>
<p>It will be able to create and edit <strong>drafts</strong> and attach visualisers to them. It cannot publish or delete.</p>
<p>Returns to <code>{host}</code></p>
<form method="post" action="/api/oauth/consent">
<input type="hidden" name="request" value="{request}">
<button class="no" name="decision" value="deny">Deny</button>
<button class="yes" name="decision" value="approve">Approve</button>
</form></main></body></html>"""


@oauth_router.get("/consent", response_class=HTMLResponse)
def consent_page(request: Request):
    request_token = request.query_params.get("request", "")
    grant = _decode_consent(request_token)

    if verify_token(request.cookies.get("access_token")) is None:
        next_path = f"/api/oauth/consent?{urlencode({'request': request_token})}"
        return RedirectResponse(f"{config.API_URL}/api/auth/github/login?{urlencode({'next': next_path})}")

    return CONSENT_PAGE.format(
        client=html.escape(grant.get("client_name") or "Claude"),
        host=html.escape(urlparse(grant["redirect_uri"]).netloc),
        request=html.escape(request_token, quote=True),
    )


@oauth_router.post("/consent")
async def consent_decision(
    request: Request,
    request_token: str = Form(..., alias="request"),
    decision: str = Form(...),
    auth=Depends(require_authentication),
):
    origin = request.headers.get("origin")
    if origin and origin != config.API_URL:
        raise HTTPException(status_code=403, detail="Approval must come from this page")

    grant = _decode_consent(request_token)
    redirect_uri, state = grant["redirect_uri"], grant["state"]

    if decision != "approve":
        return RedirectResponse(
            construct_redirect_uri(redirect_uri, error="access_denied", state=state), status_code=303
        )

    code = await oauth_provider.issue_code(
        grant["client_id"],
        {
            "scopes": grant["scopes"],
            "code_challenge": grant["code_challenge"],
            "redirect_uri": redirect_uri,
            "redirect_uri_provided_explicitly": grant["redirect_uri_provided_explicitly"],
            "resource": grant["resource"],
        },
    )

    return RedirectResponse(construct_redirect_uri(redirect_uri, code=code, state=state), status_code=303)
