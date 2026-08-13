import re
import unicodedata

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models


def slugify(value: str) -> str:
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

    slug = slug.strip("-").lower()

    return slug or "article"


def generate_unique_slug(
    db: Session,
    title: str,
) -> str:
    base_slug = slugify(title)
    candidate_slug = base_slug
    suffix = 2

    while True:
        statement = select(models.Post.id).where(
            models.Post.slug == candidate_slug
        )

        existing_post_id = db.scalar(statement)

        if existing_post_id is None:
            return candidate_slug

        candidate_slug = f"{base_slug}-{suffix}"
        suffix += 1