"""create followers table

Revision ID: 74351b9c7b50
Revises: 1d140c2924d6
Create Date: 2025-07-31 21:09:00.873559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74351b9c7b50'
down_revision: Union[str, Sequence[str], None] = '1d140c2924d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('followers',
        sa.Column('follower_id', sa.Integer(),nullable=False),
        sa.Column('following_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),server_default=sa.text('now()'),nullable=False),

        sa.PrimaryKeyConstraint('follower_id','following_id'),
        sa.ForeignKeyConstraint(['follower_id'],['users.id'],ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['following_id'],['users.id'],ondelete='CASCADE'),

        sa.CheckConstraint('follower_id!=following_id', name='chk_no_self_follow')
        )
    op.create_index('idx_followers_follower_id', 'followers', ['follower_id'])
    op.create_index('idx_followers_following_id', 'followers', ['following_id'])
    op.create_index('idx_followers_created_at', 'followers', ['created_at'])

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_followers_created_at', table_name='followers')
    op.drop_index('idx_followers_following_id', table_name='followers')
    op.drop_index('idx_followers_follower_id', table_name='followers')
    
    op.drop_table('followers')
