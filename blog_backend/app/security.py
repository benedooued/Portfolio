import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app import models
from app.database import get_db


load_dotenv()


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY n'est pas défini dans le fichier .env."
    )

# Initialisation avec l'algorithme recommandé (Argon2)
password_hash = PasswordHash.recommended()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


DatabaseSession = Annotated[Session, Depends(get_db)]


def hash_password(password: str) -> str:
    """Hash a password using the recommended algorithm (Argon2)."""
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    user_id: int,
) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration,
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DatabaseSession,
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        subject = payload.get("sub")

        if subject is None:
            raise credentials_exception

        try:
            user_id = int(subject)
        except (TypeError, ValueError):
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception

    user = db.get(models.User, user_id)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé",
        )

    return user


def require_admin(
    current_user: Annotated[
        models.User,
        Depends(get_current_user),
    ],
) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur",
        )

    return current_user