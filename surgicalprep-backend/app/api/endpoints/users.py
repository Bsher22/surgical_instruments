"""
User management endpoints: profile, settings, subscription status.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import User, PreferenceCard, QuizSession
from app.core.security import get_current_user_id, verify_password, get_password_hash
from app.core.config import settings
from app.schemas.user import UserResponse, UserUpdate, PasswordChange, SubscriptionStatus

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get current authenticated user profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Update current user profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.flush()
    return user


@router.post("/me/change-password")
async def change_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Change user password."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    user.password_hash = get_password_hash(data.new_password)
    await db.flush()
    
    return {"message": "Password updated successfully"}


@router.get("/me/subscription", response_model=SubscriptionStatus)
async def get_subscription_status(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get user's subscription status and usage limits."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Count cards
    cards_result = await db.execute(
        select(func.count(PreferenceCard.id))
        .where(PreferenceCard.user_id == user_id)
    )
    cards_count = cards_result.scalar() or 0
    
    # Count today's quizzes
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    quizzes_result = await db.execute(
        select(func.count(QuizSession.id))
        .where(QuizSession.user_id == user_id)
        .where(QuizSession.started_at >= today_start)
    )
    quizzes_today = quizzes_result.scalar() or 0
    
    # Determine limits based on tier
    is_premium = user.subscription_tier == "premium"
    is_active = is_premium and (
        user.subscription_expires_at is None or 
        user.subscription_expires_at > datetime.now(timezone.utc)
    )
    
    return SubscriptionStatus(
        tier=user.subscription_tier,
        expires_at=user.subscription_expires_at,
        is_active=is_active or user.subscription_tier == "free",
        cards_used=cards_count,
        cards_limit=-1 if is_active else settings.FREE_TIER_CARDS_LIMIT,
        quizzes_today=quizzes_today,
        quizzes_limit=-1 if is_active else settings.FREE_TIER_DAILY_QUIZZES,
    )


@router.delete("/me")
async def delete_account(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Delete user account and all associated data."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.flush()
    
    return {"message": "Account deleted successfully"}
