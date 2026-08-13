from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
  

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    
    slug: Mapped[str] = mapped_column(
        String(220),
        unique=True,
        index=True,
        nullable=False,
    )
    
    summary: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    
    likes_count: Mapped[int] = mapped_column(
    Integer,
    default=0,
    nullable=False,
    )
    
    
    published: Mapped[bool] = mapped_column(
    default=False,
    nullable=False,
    )
    
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    
    
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post",
        cascade="all, delete-orphan",
    )
    
    


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    author_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    post: Mapped["Post"] = relationship(
        back_populates="comments",
    )
    
    
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="user",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    