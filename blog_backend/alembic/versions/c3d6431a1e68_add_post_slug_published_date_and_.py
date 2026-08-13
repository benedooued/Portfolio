"""add post slug published date and cascade delete

Revision ID: c3d6431a1e68
Revises: 99436fa3d765
Create Date: 2026-08-07 04:46:48.680008

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


import re
import unicodedata




def create_slug(value: str) -> str:
    normalized_value = unicodedata.normalize(
        "NFKD",
        value,
    )

    ascii_value = normalized_value.encode(
        "ascii",
        "ignore",
    ).decode("ascii")

    slug = re.sub(
        r"[^a-zA-Z0-9]+",
        "-",
        ascii_value,
    )

    return slug.strip("-").lower() or "article"


# revision identifiers, used by Alembic.
revision: str = 'c3d6431a1e68'
down_revision: Union[str, Sequence[str], None] = '99436fa3d765'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Add slug, publication date and cascade deletion."""

    # 1. Recreate the comments foreign key with ON DELETE CASCADE.
    naming_convention = {
        "fk": (
            "fk_%(table_name)s_"
            "%(column_0_name)s_"
            "%(referred_table_name)s"
        )
    }

    with op.batch_alter_table(
        "comments",
        schema=None,
        naming_convention=naming_convention,
    ) as batch_op:
        batch_op.drop_constraint(
            "fk_comments_post_id_posts",
            type_="foreignkey",
        )

        batch_op.create_foreign_key(
            "fk_comments_post_id_posts",
            "posts",
            ["post_id"],
            ["id"],
            ondelete="CASCADE",
        )

    # 2. Add the new columns as nullable.
    # Existing articles do not yet have slug values.
    with op.batch_alter_table(
        "posts",
        schema=None,
    ) as batch_op:
        batch_op.add_column(
            sa.Column(
                "slug",
                sa.String(length=220),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "published_at",
                sa.DateTime(),
                nullable=True,
            )
        )

    # 3. Populate slug and published_at for existing articles.
    connection = op.get_bind()

    posts = connection.execute(
        sa.text(
            """
            SELECT id, title, published, created_at
            FROM posts
            ORDER BY id
            """
        )
    ).mappings().all()

    used_slugs: set[str] = set()

    for post in posts:
        base_slug = create_slug(post["title"])
        candidate_slug = base_slug
        suffix = 2

        while candidate_slug in used_slugs:
            candidate_slug = f"{base_slug}-{suffix}"
            suffix += 1

        used_slugs.add(candidate_slug)

        published_at = (
            post["created_at"]
            if post["published"]
            else None
        )

        connection.execute(
            sa.text(
                """
                UPDATE posts
                SET slug = :slug,
                    published_at = :published_at
                WHERE id = :post_id
                """
            ),
            {
                "slug": candidate_slug,
                "published_at": published_at,
                "post_id": post["id"],
            },
        )

    # 4. Make slug mandatory and create its unique index.
    with op.batch_alter_table(
        "posts",
        schema=None,
    ) as batch_op:
        batch_op.alter_column(
            "slug",
            existing_type=sa.String(length=220),
            nullable=False,
        )

        batch_op.create_index(
            "ix_posts_slug",
            ["slug"],
            unique=True,
        )
def downgrade() -> None:
    """Remove slug, publication date and cascade deletion."""

    naming_convention = {
        "fk": (
            "fk_%(table_name)s_"
            "%(column_0_name)s_"
            "%(referred_table_name)s"
        )
    }

    # 1. Restore the foreign key without cascade deletion.
    with op.batch_alter_table(
        "comments",
        schema=None,
        naming_convention=naming_convention,
    ) as batch_op:
        batch_op.drop_constraint(
            "fk_comments_post_id_posts",
            type_="foreignkey",
        )

        batch_op.create_foreign_key(
            "fk_comments_post_id_posts",
            "posts",
            ["post_id"],
            ["id"],
        )

    # 2. Remove the slug index and the two columns.
    with op.batch_alter_table(
        "posts",
        schema=None,
    ) as batch_op:
        batch_op.drop_index(
            "ix_posts_slug"
        )

        batch_op.drop_column(
            "published_at"
        )

        batch_op.drop_column(
            "slug"
        )