"""add_prints_and_site_settings

Revision ID: e5f6a7b8c9d0
Revises: d5e6f7a8b9c0
Create Date: 2026-11-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd5e6f7a8b9c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('blogs', sa.Column('print_url', sa.String(length=500), nullable=True))
    op.add_column('blogs', sa.Column('show_print', sa.Boolean(), server_default=sa.false(), nullable=False))
    site_settings = op.create_table(
        'site_settings',
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('value', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('key'),
    )
    op.bulk_insert(site_settings, [{'key': 'covers_enabled', 'value': True}])


def downgrade() -> None:
    op.drop_table('site_settings')
    op.drop_column('blogs', 'show_print')
    op.drop_column('blogs', 'print_url')
