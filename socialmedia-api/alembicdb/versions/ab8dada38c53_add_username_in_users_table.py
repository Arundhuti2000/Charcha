"""add username in users table

Revision ID: ab8dada38c53
Revises: 74351b9c7b50
Create Date: 2025-08-16 11:30:29.853210

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab8dada38c53'
down_revision: Union[str, Sequence[str], None] = '74351b9c7b50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add username column (unique, required)
    op.add_column('users', sa.Column('username', sa.String(50), nullable=True))
    
    # Add full_name column (optional)
    op.add_column('users', sa.Column('full_name', sa.String(100), nullable=True))
    
    # Create unique constraint for username
    op.create_unique_constraint('uq_users_username', 'users', ['username'])
    
    # Create index for faster username lookups
    op.create_index('idx_users_username', 'users', ['username'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_users_username', table_name='users')
    op.drop_constraint('uq_users_username', 'users', type_='unique')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'username')
