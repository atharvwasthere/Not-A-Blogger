from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from database import BaseModel


class OAuthClient(BaseModel):
    __tablename__ = "oauth_clients"

    client_id = Column(String, primary_key=True)
    info = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class OAuthCode(BaseModel):
    __tablename__ = "oauth_codes"

    # Codes and tokens are stored hashed, so a database leak hands out nothing usable.
    code_hash = Column(String(64), primary_key=True)
    client_id = Column(String, nullable=False)
    grant = Column(JSON, nullable=False)
    expires_at = Column(DateTime, nullable=False)


class OAuthToken(BaseModel):
    __tablename__ = "oauth_tokens"

    token_hash = Column(String(64), primary_key=True)
    kind = Column(String(10), nullable=False)
    # An access token and its refresh token share a family, so revoking either ends both.
    family = Column(String, nullable=False, index=True)
    client_id = Column(String, nullable=False)
    scopes = Column(JSON, nullable=False)
    resource = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
