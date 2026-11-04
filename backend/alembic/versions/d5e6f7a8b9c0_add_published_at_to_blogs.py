"""add_published_at_to_blogs

Revision ID: d5e6f7a8b9c0
Revises: d4e5f6a7b8c9
Create Date: 2026-11-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('blogs', sa.Column('published_at', sa.DateTime(), nullable=True))
    # Existing posts were published when they were created; there is no better record of it.
    op.execute("UPDATE blogs SET published_at = created_at WHERE is_published")


def downgrade() -> None:
    op.drop_column('blogs', 'published_at')
