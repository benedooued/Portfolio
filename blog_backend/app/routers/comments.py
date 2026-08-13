from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db


router = APIRouter(
    prefix="/posts",
    tags=["Public comments"],
)


DatabaseSession = Annotated[Session, Depends(get_db)]


def get_published_post_or_404(
    post_id: int,
    db: Session,
) -> models.Post:
    post = db.get(models.Post, post_id)

    if post is None or not post.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    return post


@router.post(
    "/{post_id}/comments",
    response_model=schemas.CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    comment_data: schemas.CommentCreate,
    db: DatabaseSession,
):
    get_published_post_or_404(post_id, db)

    new_comment = models.Comment(
        author_name=comment_data.author_name,
        content=comment_data.content,
        post_id=post_id,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment


@router.get(
    "/{post_id}/comments",
    response_model=list[schemas.CommentResponse],
)
def get_post_comments(
    post_id: int,
    db: DatabaseSession,
):
    get_published_post_or_404(post_id, db)

    statement = (
        select(models.Comment)
        .where(models.Comment.post_id == post_id)
        .order_by(models.Comment.created_at.desc())
    )

    comments = db.scalars(statement).all()

    return comments