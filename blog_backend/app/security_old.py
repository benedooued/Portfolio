import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash


load_dotenv()


ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


if not ADMIN_USERNAME:
    raise RuntimeError("ADMIN_USERNAME n'est pas défini.")

if not ADMIN_PASSWORD_HASH:
    raise RuntimeError("ADMIN_PASSWORD_HASH n'est pas défini.")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY n'est pas défini.")


password_hash = PasswordHash.recommended()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


def verify_admin_credentials(
    username: str,
    password: str,
) -> bool:
    if username != ADMIN_USERNAME:
        return False

    return password_hash.verify(
        password,
        ADMIN_PASSWORD_HASH,
    )


def create_access_token(
    subject: str,
) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "exp": expiration,
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def get_current_admin(
    token: str = Depends(oauth2_scheme),
) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        username = payload.get("sub")

        if username is None:
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception

    if username != ADMIN_USERNAME:
        raise credentials_exception

    return username