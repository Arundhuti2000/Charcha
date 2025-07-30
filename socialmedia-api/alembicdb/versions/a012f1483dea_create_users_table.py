"""create users table

Revision ID: a012f1483dea
Revises: 10d09479e582
Create Date: 2025-07-29 11:38:32.650948

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a012f1483dea'
down_revision: Union[str, Sequence[str], None] = '10d09479e582'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default='now()', nullable=False),
        sa.Column('phone_number', sa.String(length=15), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('users')
