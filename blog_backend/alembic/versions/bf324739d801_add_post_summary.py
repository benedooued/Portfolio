"""add post summary

Revision ID: bf324739d801
Revises: d4a7a1a46717
Create Date: 2026-07-20 20:20:32.876644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf324739d801'
down_revision: Union[str, Sequence[str], None] = 'd4a7a1a46717'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("posts") as batch_op:
        batch_op.add_column(
            sa.Column(
                "summary",
                sa.String(length=500),
                nullable=True,
            )
        )# ### end Alembic commands ###


def downgrade() -> None:
    with op.batch_alter_table("posts") as batch_op:
        batch_op.drop_column("summary")