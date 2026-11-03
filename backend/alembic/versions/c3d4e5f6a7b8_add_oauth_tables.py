"""add_oauth_tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-11-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'oauth_clients',
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('info', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('client_id'),
    )
    op.create_table(
        'oauth_codes',
        sa.Column('code_hash', sa.String(length=64), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('grant', sa.JSON(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('code_hash'),
    )
    op.create_table(
        'oauth_tokens',
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('kind', sa.String(length=10), nullable=False),
        sa.Column('family', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('scopes', sa.JSON(), nullable=False),
        sa.Column('resource', sa.String(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('token_hash'),
    )
    op.create_index('ix_oauth_tokens_family', 'oauth_tokens', ['family'])


def downgrade() -> None:
    op.drop_index('ix_oauth_tokens_family', table_name='oauth_tokens')
    op.drop_table('oauth_tokens')
    op.drop_table('oauth_codes')
    op.drop_table('oauth_clients')
