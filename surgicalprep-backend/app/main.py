"""
SurgicalPrep API - Main Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import auth, instruments, cards, quiz, users, storage
from app.core.config import settings
from app.db.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they don't exist (for development)
    # In production, use migrations via Alembic
    async with engine.begin() as conn:
        # Uncomment for initial setup:
        # await conn.run_sync(Base.metadata.create_all)
        pass
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="SurgicalPrep API",
    description="API for surgical instrument study and preference card management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(instruments.router, prefix="/api/instruments", tags=["Instruments"])
app.include_router(cards.router, prefix="/api/cards", tags=["Preference Cards"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz & Study"])
app.include_router(storage.router, prefix="/api/storage", tags=["Storage"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for deployment verification."""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "SurgicalPrep API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
