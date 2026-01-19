"""
Database model updates for subscription functionality.

Add these fields to your existing User model and add the new SubscriptionEvent model.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid


# ─────────────────────────────────────────────────────────────────────────────
# Add to User Model
# ─────────────────────────────────────────────────────────────────────────────

"""
Add these columns to your existing User model in app/db/models.py:

class User(Base):
    __tablename__ = "users"
    
    # ... existing fields ...
    
    # Subscription fields (ADD THESE)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    subscription_tier = Column(String(50), default="free", nullable=False)
    subscription_status = Column(String(50), default="inactive", nullable=False)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
"""


# ─────────────────────────────────────────────────────────────────────────────
# New Model: SubscriptionEvent
# ─────────────────────────────────────────────────────────────────────────────

from app.db.database import Base  # Import your Base from existing setup


class SubscriptionEvent(Base):
    """
    Tracks subscription-related events from Stripe webhooks.
    
    This provides an audit trail and helps with debugging subscription issues.
    """
    __tablename__ = "subscription_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    event_type = Column(String(100), nullable=False)
    stripe_event_id = Column(String(255), nullable=True, unique=True)
    data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="subscription_events")
    
    # Indexes
    __table_args__ = (
        Index("idx_subscription_events_user_id", "user_id"),
        Index("idx_subscription_events_stripe_event_id", "stripe_event_id"),
        Index("idx_subscription_events_event_type", "event_type"),
        Index("idx_subscription_events_created_at", "created_at"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Add to User Model Relationships
# ─────────────────────────────────────────────────────────────────────────────

"""
Add this relationship to your User model:

class User(Base):
    # ... existing fields and relationships ...
    
    # Subscription relationship (ADD THIS)
    subscription_events = relationship(
        "SubscriptionEvent",
        back_populates="user",
        cascade="all, delete-orphan"
    )
"""


# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

def is_premium(user) -> bool:
    """Check if user has premium access."""
    from app.core.stripe_config import SubscriptionTier, SubscriptionStatus
    from datetime import datetime, timezone
    
    if user.subscription_tier != SubscriptionTier.PREMIUM:
        return False
    
    if user.subscription_status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
        return False
    
    if user.subscription_expires_at:
        if user.subscription_expires_at < datetime.now(timezone.utc):
            return False
    
    return True


def get_subscription_display_info(user) -> dict:
    """Get formatted subscription info for display."""
    from app.core.stripe_config import SubscriptionTier
    
    return {
        "tier": user.subscription_tier or SubscriptionTier.FREE,
        "tier_display": "Premium" if user.subscription_tier == SubscriptionTier.PREMIUM else "Free",
        "status": user.subscription_status or "inactive",
        "expires_at": user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
        "is_premium": is_premium(user),
    }
