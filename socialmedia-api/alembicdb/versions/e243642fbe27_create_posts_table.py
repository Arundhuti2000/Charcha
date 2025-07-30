"""create posts table

Revision ID: e243642fbe27
Revises: 
Create Date: 2025-07-29 11:17:37.776976

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e243642fbe27'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table("posts",sa.Column('id',sa.Integer(), nullable=False, primary_key=True),
                    sa.Column('title',sa.Integer(), nullable=False)
                    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('posts')
