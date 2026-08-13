from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db


router = APIRouter(
    prefix="/posts",
    tags=["Public posts"],
)


DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get(
    "",
    response_model=list[schemas.PostResponse],
)
def get_posts(
    db: DatabaseSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    
    statement = (
        select(models.Post)
        .where(models.Post.published.is_(True))
        .order_by(models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    posts = db.scalars(statement).all()

    return posts


@router.get(
    "/{post_id}",
    response_model=schemas.PostResponse,
)
def get_post(
    post_id: int,
    db: DatabaseSession,
):
    post = db.get(models.Post, post_id)

    if post is None or not post.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    return post


@router.post("/{post_id}/like",
             response_model=schemas.PostResponse,
)
def like_post(
    post_id: int,
    db: DatabaseSession,
):
    post = db.get(models.Post, post_id)

    if post is None or not post.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    post.likes_count += 1
    db.commit()
    db.refresh(post)

    return post


@router.get(
    "/by-slug/{slug}",
    response_model=schemas.PostResponse,
)
def get_post_by_slug(
    slug: str,
    db: DatabaseSession,
):
    statement = select(models.Post).where(
        models.Post.slug == slug,
        models.Post.published.is_(True),
    )

    post = db.scalar(statement)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    return post