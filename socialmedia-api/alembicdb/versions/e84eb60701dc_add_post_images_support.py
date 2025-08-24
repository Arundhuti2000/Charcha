"""add post images support

Revision ID: e84eb60701dc
Revises: f6738c74acf3
Create Date: 2025-08-23 11:41:53.418505

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e84eb60701dc'
down_revision: Union[str, Sequence[str], None] = 'f6738c74acf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('post_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('blob_name', sa.String(500), nullable=False),
        sa.Column('blob_url', sa.String(1000), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('content_type', sa.String(100), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='False'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('blob_name', name='uq_post_images_blob_name')
    )
    op.create_index('idx_post_images_post_id', 'post_images', ['post_id'])
    op.create_index('idx_post_images_display_order', 'post_images', ['post_id', 'display_order'])
    op.create_index('idx_post_images_is_primary', 'post_images', ['post_id', 'is_primary'])
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_post_images_updated_at BEFORE UPDATE
        ON post_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS update_post_images_updated_at ON post_images;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
    
    # Drop indexes
    op.drop_index('idx_post_images_is_primary', table_name='post_images')
    op.drop_index('idx_post_images_display_order', table_name='post_images')
    op.drop_index('idx_post_images_post_id', table_name='post_images')
    
    # Drop table
    op.drop_table('post_images')
