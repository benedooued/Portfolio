

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    admin_comments,
    admin_posts,
    auth,
    comments,
    public_posts,
)



app = FastAPI(
    title="Portfolio Blog API",
    description="Backend simple pour gérer les articles de mon portfolio.",
    version="1.1.0"
)

app.include_router(auth.router)
app.include_router(public_posts.router)
app.include_router(admin_posts.router)
app.include_router(comments.router)
app.include_router(admin_comments.router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def home():
    return {
        "message": "Bienvenue sur l'API de mon blog",
        "documentation": "/docs",
    }