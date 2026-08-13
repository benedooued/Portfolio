from datetime import datetime
from app import models, schemas
from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=200,
    )
    
    summary: str | None = Field(
        default=None,
        max_length=500,
    )

    content: str = Field(
        min_length=1,
    )
    
    published: bool = False


class PostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )
    
    summary: str | None = Field(
        default=None,
        max_length=500,
    )
    

    content: str | None = Field(
        default=None,
        min_length=1,
    )
    published: bool | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    summary: str | None
    content: str | None
    published: bool
    published_at: datetime | None
    likes_count: int
    created_at: datetime
    updated_at: datetime
    

class CommentCreate(BaseModel):
    author_name: str = Field(
        min_length=2,
        max_length=100,
    )

    content: str = Field(
        min_length=1,
        max_length=2000,
    )


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_name: str
    content: str
    post_id: int
    created_at: datetime
    
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    
    
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime