"""
Pydantic schemas for user-related requests and responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(default="surgical_tech")
    institution: Optional[str] = Field(default=None, max_length=200)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    institution: Optional[str] = None


class UserResponse(UserBase):
    id: str
    subscription_tier: str
    subscription_expires_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    role: Optional[str] = None
    institution: Optional[str] = Field(default=None, max_length=200)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# Subscription
class SubscriptionStatus(BaseModel):
    tier: str
    expires_at: Optional[datetime] = None
    is_active: bool
    cards_used: int
    cards_limit: int
    quizzes_today: int
    quizzes_limit: int
