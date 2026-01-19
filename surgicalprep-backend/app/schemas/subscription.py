"""
Pydantic schemas for subscription-related operations.
"""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field
from uuid import UUID


# Request Schemas
class CreateCheckoutSessionRequest(BaseModel):
    """Request to create a Stripe checkout session."""
    plan: Literal["monthly", "annual"] = Field(
        ...,
        description="Subscription plan to purchase"
    )
    success_url: Optional[str] = Field(
        None,
        description="Override URL to redirect after successful payment"
    )
    cancel_url: Optional[str] = Field(
        None,
        description="Override URL to redirect after cancelled payment"
    )


class CreatePortalSessionRequest(BaseModel):
    """Request to create a Stripe customer portal session."""
    return_url: Optional[str] = Field(
        None,
        description="URL to return to after portal session"
    )


# Response Schemas
class CheckoutSessionResponse(BaseModel):
    """Response containing checkout session URL."""
    checkout_url: str = Field(..., description="Stripe checkout URL")
    session_id: str = Field(..., description="Stripe session ID")


class PortalSessionResponse(BaseModel):
    """Response containing customer portal URL."""
    portal_url: str = Field(..., description="Stripe customer portal URL")


class SubscriptionStatusResponse(BaseModel):
    """Current subscription status for a user."""
    tier: Literal["free", "premium"] = Field(
        ...,
        description="Current subscription tier"
    )
    status: str = Field(
        ...,
        description="Subscription status (active, inactive, past_due, canceled)"
    )
    plan: Optional[Literal["monthly", "annual"]] = Field(
        None,
        description="Current plan if subscribed"
    )
    expires_at: Optional[datetime] = Field(
        None,
        description="When subscription expires"
    )
    is_active: bool = Field(
        ...,
        description="Whether subscription is currently active"
    )
    can_access_premium: bool = Field(
        ...,
        description="Whether user can access premium features"
    )
    
    # Usage limits
    cards_used: int = Field(0, description="Number of cards created")
    cards_limit: Optional[int] = Field(None, description="Card limit (null if unlimited)")
    quizzes_today: int = Field(0, description="Quizzes taken today")
    quizzes_limit: Optional[int] = Field(None, description="Daily quiz limit (null if unlimited)")
    
    class Config:
        from_attributes = True


class SubscriptionPlanInfo(BaseModel):
    """Information about a subscription plan."""
    id: str = Field(..., description="Plan identifier")
    name: str = Field(..., description="Display name")
    price: float = Field(..., description="Price in dollars")
    interval: Literal["month", "year"] = Field(..., description="Billing interval")
    price_id: str = Field(..., description="Stripe price ID")
    description: str = Field(..., description="Plan description")
    savings_percent: Optional[int] = Field(None, description="Savings vs monthly")


class AvailablePlansResponse(BaseModel):
    """Available subscription plans."""
    plans: list[SubscriptionPlanInfo]


# Webhook Schemas
class WebhookEventData(BaseModel):
    """Data from a Stripe webhook event."""
    event_id: str
    event_type: str
    customer_id: Optional[str] = None
    subscription_id: Optional[str] = None
    user_id: Optional[UUID] = None
    data: dict


# Feature Gating
class PremiumRequiredError(BaseModel):
    """Error response when premium is required."""
    code: str = "PREMIUM_REQUIRED"
    message: str = "This feature requires a premium subscription"
    feature: str = Field(..., description="Feature that requires premium")
    upgrade_url: str = "/subscription/upgrade"


class FeatureAccessResponse(BaseModel):
    """Response for feature access check."""
    has_access: bool
    feature: str
    reason: Optional[str] = None
    upgrade_url: Optional[str] = None


# Usage Tracking
class UsageStats(BaseModel):
    """User's current usage statistics."""
    cards_created: int = 0
    quizzes_today: int = 0
    flashcards_today: int = 0
    last_quiz_date: Optional[datetime] = None
    last_flashcard_date: Optional[datetime] = None


class UsageLimits(BaseModel):
    """Limits for the user's current tier."""
    max_cards: Optional[int] = None
    daily_quizzes: Optional[int] = None
    daily_flashcards: Optional[int] = None
    show_full_instrument_details: bool = True


# Subscription Event (for history/logging)
class SubscriptionEventCreate(BaseModel):
    """Create a subscription event record."""
    user_id: UUID
    event_type: str
    stripe_event_id: Optional[str] = None
    data: Optional[dict] = None


class SubscriptionEventResponse(BaseModel):
    """Subscription event record."""
    id: UUID
    user_id: UUID
    event_type: str
    stripe_event_id: Optional[str]
    data: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Restore Purchases
class RestorePurchasesRequest(BaseModel):
    """Request to restore purchases."""
    email: Optional[str] = Field(
        None,
        description="Email to look up (uses authenticated user's email if not provided)"
    )


class RestorePurchasesResponse(BaseModel):
    """Result of restore purchases attempt."""
    found: bool = Field(..., description="Whether an active subscription was found")
    message: str = Field(..., description="Status message")
    subscription_status: Optional[SubscriptionStatusResponse] = None
