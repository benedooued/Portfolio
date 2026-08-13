from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app import models
from app.database import get_db
from app.security import require_admin
from app import schemas


router = APIRouter(
    prefix="/admin/comments",
    tags=["Admin comments"],
    dependencies=[Depends(require_admin)],
)


DatabaseSession = Annotated[Session, Depends(get_db)]

@router.get(
    "",
    response_model=list[schemas.CommentResponse],
)
def get_all_comments(
    db: DatabaseSession,
):
    statement = (
        select(models.Comment)
        .order_by(models.Comment.created_at.desc())
    )

    comments = db.scalars(statement).all()

    return comments


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    comment_id: int,
    db: DatabaseSession,
):
    comment = db.get(models.Comment, comment_id)

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commentaire introuvable",
        )

    db.delete(comment)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

