# from fastapi import APIRouter, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from fastapi import Depends

# from app import schemas
# from app.security import (
#     create_access_token,
#     verify_admin_credentials,
# )


# router = APIRouter(
#     prefix="/auth",
#     tags=["Authentication"],
# )


# @router.post(
#     "/login",
#     response_model=schemas.TokenResponse,
# )
# def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
# ):
#     credentials_are_valid = verify_admin_credentials(
#         username=form_data.username,
#         password=form_data.password,
#     )

#     if not credentials_are_valid:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Nom d'utilisateur ou mot de passe incorrect",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     access_token = create_access_token(
#         subject=form_data.username,
#     )

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#     }

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import (
    create_access_token,
    get_current_user,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/login",
    response_model=schemas.TokenResponse,
)
def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: DatabaseSession,
):
    statement = select(models.User).where(
        models.User.username == form_data.username
    )

    user = db.scalar(statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou password incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    password_is_valid = verify_password(
        plain_password=form_data.password,
        hashed_password=user.password_hash,
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou password incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact the administrator.",
        )

    access_token = create_access_token(
        user_id=user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=schemas.UserResponse,
)
def get_me(
    current_user: Annotated[
        models.User,
        Depends(get_current_user),
    ],
):
    return current_user