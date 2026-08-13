"""add post slug published date and cascade delete

Revision ID: c3d6431a1e68
Revises: 99436fa3d765
Create Date: 2026-08-07 04:46:48.680008
"""

import re
import unicodedata
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d6431a1e68"
down_revision: Union[str, Sequence[str], None] = "99436fa3d765"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NAMING_CONVENTION = {
    "fk": (
        "fk_%(table_name)s_"
        "%(column_0_name)s_"
        "%(referred_table_name)s"
    )
}


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


def get_comments_post_fk_name(connection):
    """
    Return the actual foreign-key constraint name used by the DB
    for comments.post_id -> posts.id.

    PostgreSQL generates a name automatically when none was
    explicitly specified in the original migration.
    """
    inspector = sa.inspect(connection)

    foreign_keys = inspector.get_foreign_keys(
        "comments"
    )

    for foreign_key in foreign_keys:
        if (
            foreign_key.get("referred_table") == "posts"
            and foreign_key.get("constrained_columns")
            == ["post_id"]
        ):
            return foreign_key.get("name")

    return None


def upgrade() -> None:
    """Add slug, publication date and cascade deletion."""

    connection = op.get_bind()
    dialect_name = connection.dialect.name

    # ---------------------------------------------------------
    # 1. Change comments.post_id FK to ON DELETE CASCADE
    # ---------------------------------------------------------

    if dialect_name == "sqlite":
        # SQLite can have truly unnamed foreign-key constraints.
        # naming_convention gives the reflected constraint a
        # predictable temporary name so Alembic can drop it.
        with op.batch_alter_table(
            "comments",
            schema=None,
            naming_convention=NAMING_CONVENTION,
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

    else:
        # PostgreSQL (and most other DBs) generates a name for
        # an unnamed FK. Discover that actual name instead of
        # guessing it.
        foreign_key_name = get_comments_post_fk_name(
            connection
        )

        if foreign_key_name is None:
            raise RuntimeError(
                "Foreign key comments.post_id -> posts.id "
                "was not found."
            )

        op.drop_constraint(
            foreign_key_name,
            "comments",
            type_="foreignkey",
        )

        op.create_foreign_key(
            "fk_comments_post_id_posts",
            "comments",
            "posts",
            ["post_id"],
            ["id"],
            ondelete="CASCADE",
        )

    # ---------------------------------------------------------
    # 2. Add slug and published_at
    # ---------------------------------------------------------

    with op.batch_alter_table(
        "posts",
        schema=None,
    ) as batch_op:
        # slug is temporarily nullable because existing posts
        # don't have values yet.
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

    # ---------------------------------------------------------
    # 3. Populate existing posts
    # ---------------------------------------------------------

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
        base_slug = create_slug(
            post["title"]
        )

        candidate_slug = base_slug
        suffix = 2

        while candidate_slug in used_slugs:
            candidate_slug = (
                f"{base_slug}-{suffix}"
            )
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

    # ---------------------------------------------------------
    # 4. Make slug mandatory + unique
    # ---------------------------------------------------------

    with op.batch_alter_table(
        "posts",
        schema=None,
    ) as batch_op:
        batch_op.alter_column(
            "slug",
            existing_type=sa.String(
                length=220
            ),
            nullable=False,
        )

        batch_op.create_index(
            "ix_posts_slug",
            ["slug"],
            unique=True,
        )


def downgrade() -> None:
    """Remove slug, publication date and cascade deletion."""

    connection = op.get_bind()
    dialect_name = connection.dialect.name

    # ---------------------------------------------------------
    # 1. Restore FK without ON DELETE CASCADE
    # ---------------------------------------------------------

    if dialect_name == "sqlite":
        with op.batch_alter_table(
            "comments",
            schema=None,
            naming_convention=NAMING_CONVENTION,
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

    else:
        foreign_key_name = get_comments_post_fk_name(
            connection
        )

        if foreign_key_name is None:
            raise RuntimeError(
                "Foreign key comments.post_id -> posts.id "
                "was not found."
            )

        op.drop_constraint(
            foreign_key_name,
            "comments",
            type_="foreignkey",
        )

        op.create_foreign_key(
            "fk_comments_post_id_posts",
            "comments",
            "posts",
            ["post_id"],
            ["id"],
        )

    # ---------------------------------------------------------
    # 2. Remove slug and published_at
    # ---------------------------------------------------------

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