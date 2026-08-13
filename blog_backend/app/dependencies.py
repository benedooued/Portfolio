import os
import secrets
from typing import Annotated

from dotenv import load_dotenv
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader


load_dotenv()


ADMIN_KEY = os.getenv("ADMIN_KEY")

if not ADMIN_KEY:
    raise RuntimeError(
        "La variable d'environnement ADMIN_KEY n'est pas définie."
    )


admin_key_header = APIKeyHeader(
    name="X-Admin-Key",
    auto_error=False,
)


def verify_admin_key(
    provided_key: Annotated[str | None, Security(admin_key_header)],
) -> None:
    if provided_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clé administrateur manquante",
        )

    if not secrets.compare_digest(provided_key, ADMIN_KEY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clé administrateur invalide",
        )