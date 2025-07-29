"""create constraints on posts and users table

Revision ID: c24272c3c830
Revises: a012f1483dea
Create Date: 2025-07-29 11:44:17.944668

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c24272c3c830'
down_revision: Union[str, Sequence[str], None] = 'a012f1483dea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(
        'fk_posts_user_id',  # constraint name
        'posts',              # source table
        'users',              # target table
        ['user_id'],          # source column
        ['id'],               # target column
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_posts_user_id', 'posts', type_='foreignkey')
