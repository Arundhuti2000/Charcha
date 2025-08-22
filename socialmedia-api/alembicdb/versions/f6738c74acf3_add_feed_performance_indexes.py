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
    # Index for post category (used in recommendations)
    op.create_index('idx_posts_category', 'posts', ['category'])
    
    # Index for post created_at (used in chronological feeds)
    op.create_index('idx_posts_created_at', 'posts', ['created_at'])
    
    # Index for post published status
    op.create_index('idx_posts_published', 'posts', ['published'])
    
    # Composite index for post user_id and created_at (user's posts chronologically)
    op.create_index('idx_posts_user_created', 'posts', ['user_id', 'created_at'])
    
    # Composite index for votes (post_id, user_id) - already exists as primary key
    # Composite index for vote direction and post_id (for trending calculations)
    op.create_index('idx_votes_post_dir', 'votes', ['post_id', 'dir'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_votes_post_dir', table_name='votes')
    op.drop_index('idx_posts_user_created', table_name='posts')
    op.drop_index('idx_posts_published', table_name='posts')
    op.drop_index('idx_posts_created_at', table_name='posts')
    op.drop_index('idx_posts_category', table_name='posts')
