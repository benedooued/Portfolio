from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import require_admin
from sqlalchemy import select

from datetime import datetime, timezone

from app.utils.slug import generate_unique_slug


router = APIRouter(
    prefix="/admin/posts",
    tags=["Admin posts"],
    dependencies=[Depends(require_admin)],
)


DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=schemas.PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    post_data: schemas.PostCreate,
    db: DatabaseSession,
):
    
    slug = generate_unique_slug(
        db=db,
        title=post_data.title,
    )

    published_at = None

    if post_data.published:
        published_at = datetime.now(timezone.utc)
    
    
    new_post = models.Post(
        title=post_data.title,
        slug=slug,
        summary=post_data.summary,
        content=post_data.content,
        published=post_data.published,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


@router.patch(
    "/{post_id}",
    response_model=schemas.PostResponse,
)
def update_post(
    post_id: int,
    post_data: schemas.PostUpdate,
    db: DatabaseSession,
):
    post = db.get(models.Post, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    update_data = post_data.model_dump(
        exclude_unset=True
    )
    
    if "published" in update_data:
        new_published_value = update_data["published"]
        
        if new_published_value and not post.published:
            post.published_at = datetime.now(timezone.utc)
        elif not new_published_value and post.published:
            post.published_at = None

    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    return post


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_post(
    post_id: int,
    db: DatabaseSession,
):
    post = db.get(models.Post, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    db.delete(post)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "",
    response_model=list[schemas.PostResponse],
)
def get_all_posts(
    db: DatabaseSession,
):
    statement = (
        select(models.Post)
        .order_by(models.Post.created_at.desc())
    )

    posts = db.scalars(statement).all()

    return posts


@router.get(
    "/{post_id}",
    response_model=schemas.PostResponse,
)
def get_admin_post(
    post_id: int,
    db: DatabaseSession,
):
    post = db.get(models.Post, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable",
        )

    return post