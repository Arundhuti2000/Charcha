"""create published, rating, created by, category column

Revision ID: 10d09479e582
Revises: a1e56d5cee0e
Create Date: 2025-07-29 11:37:02.666842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '10d09479e582'
down_revision: Union[str, Sequence[str], None] = 'a1e56d5cee0e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('published', sa.Boolean(), server_default='True', nullable=True))
    op.add_column('posts', sa.Column('rating', sa.Integer(), nullable=False))
    op.add_column('posts', sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default='now()', nullable=False))
    op.add_column('posts', sa.Column('category', sa.String(length=50), nullable=False))
    op.add_column('posts', sa.Column('user_id', sa.Integer(), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts', 'category')
    op.drop_column('posts', 'created_at')
    op.drop_column('posts', 'rating')
    op.drop_column('posts', 'published')
    op.drop_column('posts', 'user_id')

