"""add chat mode

Revision ID: 20260524_0001
Revises:
Create Date: 2026-05-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20260524_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "chats",
        sa.Column("mode", sa.String(), nullable=False, server_default="lite"),
    )
    op.alter_column("chats", "mode", server_default=None)


def downgrade():
    op.drop_column("chats", "mode")
