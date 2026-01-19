"""
Stripe configuration and initialization.
"""
import stripe
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional


class StripeSettings(BaseSettings):
    """Stripe configuration settings."""
    
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    stripe_monthly_price_id: str
    stripe_annual_price_id: str
    frontend_url: str = "surgicalprep://"
    
    # URLs for checkout redirects
    checkout_success_url: str = "surgicalprep://subscription/success"
    checkout_cancel_url: str = "surgicalprep://subscription/cancel"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_stripe_settings() -> StripeSettings:
    """Get cached Stripe settings."""
    return StripeSettings()


def init_stripe() -> None:
    """Initialize Stripe with API key."""
    settings = get_stripe_settings()
    stripe.api_key = settings.stripe_secret_key


# Initialize on module import
init_stripe()


# Price ID mapping
class PriceIds:
    """Stripe Price IDs for subscription plans."""
    
    @staticmethod
    def get_monthly() -> str:
        return get_stripe_settings().stripe_monthly_price_id
    
    @staticmethod
    def get_annual() -> str:
        return get_stripe_settings().stripe_annual_price_id
    
    @staticmethod
    def get_price_id(plan: str) -> str:
        """Get price ID for a plan."""
        if plan == "monthly":
            return PriceIds.get_monthly()
        elif plan == "annual":
            return PriceIds.get_annual()
        else:
            raise ValueError(f"Invalid plan: {plan}")


# Subscription tier constants
class SubscriptionTier:
    FREE = "free"
    PREMIUM = "premium"


class SubscriptionStatus:
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"


# Feature limits by tier
FREE_TIER_LIMITS = {
    "max_cards": 5,
    "daily_quizzes": 3,
    "daily_flashcards": 10,
    "show_full_instrument_details": False,
}

PREMIUM_FEATURES = [
    "unlimited_cards",
    "unlimited_quizzes",
    "unlimited_flashcards",
    "full_instrument_details",
    "ad_free",
]
