"""add_tags_and_series_to_blogs

Revision ID: a1b2c3d4e5f6
Revises: 1cdfe9d0a272
Create Date: 2026-06-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '1cdfe9d0a272'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # tags: non-null with empty-array default so the 4 existing rows backfill
    # to {} (never NULL) — the frontend sidebar/⌘K rely on tags being an array.
    op.add_column(
        'blogs',
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
    )
    op.add_column('blogs', sa.Column('series', sa.String(length=100), nullable=True))
    op.add_column('blogs', sa.Column('series_order', sa.Integer(), nullable=True))
    op.create_index('ix_blogs_series', 'blogs', ['series'])


def downgrade() -> None:
    op.drop_index('ix_blogs_series', table_name='blogs')
    op.drop_column('blogs', 'series_order')
    op.drop_column('blogs', 'series')
    op.drop_column('blogs', 'tags')
