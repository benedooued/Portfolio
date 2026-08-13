from getpass import getpass

from sqlalchemy import or_, select

from app import models
from app.database import SessionLocal
from app.security import hash_password


def create_admin() -> None:
    username = input("Nom d'utilisateur admin : ").strip()
    email = input("Email admin : ").strip()
    password = getpass("Mot de passe admin : ")
    password_confirmation = getpass(
        "Confirmez le mot de passe : "
    )

    if not username:
        print("Le nom d'utilisateur est obligatoire.")
        return

    if not email:
        print("L'email est obligatoire.")
        return

    if len(password) < 8:
        print(
            "Le mot de passe doit contenir au moins 8 caractères."
        )
        return

    if password != password_confirmation:
        print("Les mots de passe ne correspondent pas.")
        return

    db = SessionLocal()

    try:
        statement = select(models.User).where(
            or_(
                models.User.username == username,
                models.User.email == email,
            )
        )

        existing_user = db.scalar(statement)

        if existing_user is not None:
            print(
                "Un utilisateur avec ce nom ou cet email existe déjà."
            )
            return

        admin = models.User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Administrateur créé avec succès.")
        print(f"ID : {admin.id}")
        print(f"Nom : {admin.username}")
        print(f"Email : {admin.email}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()