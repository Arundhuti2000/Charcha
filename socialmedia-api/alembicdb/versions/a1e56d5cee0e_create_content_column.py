"""create content column

Revision ID: a1e56d5cee0e
Revises: e243642fbe27
Create Date: 2025-07-29 11:29:43.011047

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1e56d5cee0e'
down_revision: Union[str, Sequence[str], None] = 'e243642fbe27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('content',sa.String(), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts','content')
