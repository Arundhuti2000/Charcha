"""add feed performance indexes

Revision ID: f6738c74acf3
Revises: ab8dada38c53
Create Date: 2025-08-22 12:29:12.564411

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6738c74acf3'
down_revision: Union[str, Sequence[str], None] = 'ab8dada38c53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index('idx_posts_category', 'posts', ['category'])
    
    op.create_index('idx_posts_created_at', 'posts', ['created_at'])
    
    op.create_index('idx_posts_published', 'posts', ['published'])

    op.create_index('idx_posts_user_created', 'posts', ['user_id', 'created_at'])

    op.create_index('idx_votes_post_dir', 'votes', ['post_id', 'dir'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_votes_post_dir', table_name='votes')
    op.drop_index('idx_posts_user_created', table_name='posts')
    op.drop_index('idx_posts_published', table_name='posts')
    op.drop_index('idx_posts_created_at', table_name='posts')
    op.drop_index('idx_posts_category', table_name='posts')
