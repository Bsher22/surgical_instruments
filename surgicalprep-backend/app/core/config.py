"""
Application configuration using Pydantic Settings.
"""
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SurgicalPrep API"
    DEBUG: bool = False

    # Database (Railway PostgreSQL)
    DATABASE_URL: str

    # Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cloudflare R2 Storage (S3-compatible)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "surgicalprep-images"
    R2_PUBLIC_URL: str = ""  # Your R2 public bucket URL or custom domain

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_MONTHLY: str = ""
    STRIPE_PRICE_ANNUAL: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:8081", "http://localhost:19006"]

    # Free tier limits
    FREE_TIER_CARDS_LIMIT: int = 5
    FREE_TIER_DAILY_QUIZZES: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
