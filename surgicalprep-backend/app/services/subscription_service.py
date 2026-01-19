"""
Subscription service handling Stripe integration and business logic.
"""
import stripe
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.stripe_config import (
    get_stripe_settings,
    PriceIds,
    SubscriptionTier,
    SubscriptionStatus,
    FREE_TIER_LIMITS,
)
from app.db.models import User, PreferenceCard, QuizSession
from app.schemas.subscription import (
    SubscriptionStatusResponse,
    UsageStats,
    UsageLimits,
    SubscriptionPlanInfo,
)


class SubscriptionService:
    """Service for managing subscriptions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_stripe_settings()
    
    # ─────────────────────────────────────────────────────────────────
    # Checkout Session Management
    # ─────────────────────────────────────────────────────────────────
    
    async def create_checkout_session(
        self,
        user: User,
        plan: str,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Create a Stripe checkout session for subscription.
        
        Returns:
            Tuple of (checkout_url, session_id)
        """
        # Get or create Stripe customer
        customer_id = await self._get_or_create_customer(user)
        
        # Get price ID for plan
        price_id = PriceIds.get_price_id(plan)
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url or self.settings.checkout_success_url,
            cancel_url=cancel_url or self.settings.checkout_cancel_url,
            metadata={
                "user_id": str(user.id),
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(user.id),
                    "plan": plan,
                }
            },
            allow_promotion_codes=True,
        )
        
        return session.url, session.id
    
    async def create_portal_session(
        self,
        user: User,
        return_url: Optional[str] = None,
    ) -> str:
        """
        Create a Stripe customer portal session.
        
        Returns:
            Portal URL
        """
        if not user.stripe_customer_id:
            raise ValueError("User has no Stripe customer ID")
        
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url or self.settings.frontend_url,
        )
        
        return session.url
    
    # ─────────────────────────────────────────────────────────────────
    # Customer Management
    # ─────────────────────────────────────────────────────────────────
    
    async def _get_or_create_customer(self, user: User) -> str:
        """Get existing Stripe customer or create new one."""
        if user.stripe_customer_id:
            return user.stripe_customer_id
        
        # Create new customer
        customer = stripe.Customer.create(
            email=user.email,
            name=user.name,
            metadata={
                "user_id": str(user.id),
            }
        )
        
        # Update user with customer ID
        user.stripe_customer_id = customer.id
        await self.db.commit()
        
        return customer.id
    
    # ─────────────────────────────────────────────────────────────────
    # Webhook Handling
    # ─────────────────────────────────────────────────────────────────
    
    async def handle_checkout_completed(
        self,
        session: stripe.checkout.Session,
    ) -> None:
        """Handle successful checkout completion."""
        user_id = session.metadata.get("user_id")
        if not user_id:
            raise ValueError("No user_id in session metadata")
        
        # Get user
        result = await self.db.execute(
            select(User).where(User.id == UUID(user_id))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError(f"User not found: {user_id}")
        
        # Get subscription details
        subscription = stripe.Subscription.retrieve(session.subscription)
        
        # Update user subscription
        user.stripe_customer_id = session.customer
        user.stripe_subscription_id = session.subscription
        user.subscription_tier = SubscriptionTier.PREMIUM
        user.subscription_status = SubscriptionStatus.ACTIVE
        user.subscription_expires_at = datetime.fromtimestamp(
            subscription.current_period_end,
            tz=timezone.utc
        )
        
        await self.db.commit()
    
    async def handle_subscription_updated(
        self,
        subscription: stripe.Subscription,
    ) -> None:
        """Handle subscription update events."""
        user_id = subscription.metadata.get("user_id")
        if not user_id:
            # Try to find user by customer ID
            result = await self.db.execute(
                select(User).where(User.stripe_customer_id == subscription.customer)
            )
            user = result.scalar_one_or_none()
        else:
            result = await self.db.execute(
                select(User).where(User.id == UUID(user_id))
            )
            user = result.scalar_one_or_none()
        
        if not user:
            return  # User not found, skip
        
        # Map Stripe status to our status
        status_map = {
            "active": SubscriptionStatus.ACTIVE,
            "past_due": SubscriptionStatus.PAST_DUE,
            "canceled": SubscriptionStatus.CANCELED,
            "trialing": SubscriptionStatus.TRIALING,
            "incomplete": SubscriptionStatus.INACTIVE,
            "incomplete_expired": SubscriptionStatus.INACTIVE,
            "unpaid": SubscriptionStatus.INACTIVE,
        }
        
        user.subscription_status = status_map.get(
            subscription.status,
            SubscriptionStatus.INACTIVE
        )
        user.subscription_expires_at = datetime.fromtimestamp(
            subscription.current_period_end,
            tz=timezone.utc
        )
        
        # Update tier based on status
        if subscription.status in ["active", "trialing"]:
            user.subscription_tier = SubscriptionTier.PREMIUM
        elif subscription.status == "canceled":
            # Keep premium until period ends
            if user.subscription_expires_at > datetime.now(timezone.utc):
                user.subscription_tier = SubscriptionTier.PREMIUM
            else:
                user.subscription_tier = SubscriptionTier.FREE
        else:
            user.subscription_tier = SubscriptionTier.FREE
        
        await self.db.commit()
    
    async def handle_subscription_deleted(
        self,
        subscription: stripe.Subscription,
    ) -> None:
        """Handle subscription deletion/cancellation."""
        # Find user by subscription ID
        result = await self.db.execute(
            select(User).where(User.stripe_subscription_id == subscription.id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return
        
        user.subscription_tier = SubscriptionTier.FREE
        user.subscription_status = SubscriptionStatus.CANCELED
        # Keep subscription_expires_at for reference
        
        await self.db.commit()
    
    async def handle_invoice_payment_succeeded(
        self,
        invoice: stripe.Invoice,
    ) -> None:
        """Handle successful invoice payment (renewal)."""
        if not invoice.subscription:
            return
        
        # Get subscription to update period end
        subscription = stripe.Subscription.retrieve(invoice.subscription)
        await self.handle_subscription_updated(subscription)
    
    async def handle_invoice_payment_failed(
        self,
        invoice: stripe.Invoice,
    ) -> None:
        """Handle failed invoice payment."""
        if not invoice.subscription:
            return
        
        # Find user
        result = await self.db.execute(
            select(User).where(User.stripe_subscription_id == invoice.subscription)
        )
        user = result.scalar_one_or_none()
        
        if user:
            user.subscription_status = SubscriptionStatus.PAST_DUE
            await self.db.commit()
    
    # ─────────────────────────────────────────────────────────────────
    # Subscription Status
    # ─────────────────────────────────────────────────────────────────
    
    async def get_subscription_status(
        self,
        user: User,
    ) -> SubscriptionStatusResponse:
        """Get current subscription status for user."""
        # Get usage stats
        usage = await self._get_usage_stats(user)
        limits = self._get_limits_for_tier(user.subscription_tier)
        
        # Determine if subscription is active
        is_active = (
            user.subscription_tier == SubscriptionTier.PREMIUM and
            user.subscription_status == SubscriptionStatus.ACTIVE and
            (
                user.subscription_expires_at is None or
                user.subscription_expires_at > datetime.now(timezone.utc)
            )
        )
        
        # Determine plan from Stripe if subscribed
        plan = None
        if user.stripe_subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
                if subscription.items.data:
                    price_id = subscription.items.data[0].price.id
                    if price_id == PriceIds.get_monthly():
                        plan = "monthly"
                    elif price_id == PriceIds.get_annual():
                        plan = "annual"
            except stripe.error.StripeError:
                pass
        
        return SubscriptionStatusResponse(
            tier=user.subscription_tier or SubscriptionTier.FREE,
            status=user.subscription_status or SubscriptionStatus.INACTIVE,
            plan=plan,
            expires_at=user.subscription_expires_at,
            is_active=is_active,
            can_access_premium=is_active,
            cards_used=usage.cards_created,
            cards_limit=limits.max_cards,
            quizzes_today=usage.quizzes_today,
            quizzes_limit=limits.daily_quizzes,
        )
    
    async def _get_usage_stats(self, user: User) -> UsageStats:
        """Get user's current usage statistics."""
        # Count cards
        cards_result = await self.db.execute(
            select(func.count(PreferenceCard.id)).where(
                PreferenceCard.user_id == user.id
            )
        )
        cards_count = cards_result.scalar() or 0
        
        # Count today's quizzes
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        quizzes_result = await self.db.execute(
            select(func.count(QuizSession.id)).where(
                QuizSession.user_id == user.id,
                QuizSession.created_at >= today_start
            )
        )
        quizzes_today = quizzes_result.scalar() or 0
        
        return UsageStats(
            cards_created=cards_count,
            quizzes_today=quizzes_today,
        )
    
    def _get_limits_for_tier(self, tier: str) -> UsageLimits:
        """Get limits for a subscription tier."""
        if tier == SubscriptionTier.PREMIUM:
            return UsageLimits(
                max_cards=None,
                daily_quizzes=None,
                daily_flashcards=None,
                show_full_instrument_details=True,
            )
        else:
            return UsageLimits(
                max_cards=FREE_TIER_LIMITS["max_cards"],
                daily_quizzes=FREE_TIER_LIMITS["daily_quizzes"],
                daily_flashcards=FREE_TIER_LIMITS["daily_flashcards"],
                show_full_instrument_details=FREE_TIER_LIMITS["show_full_instrument_details"],
            )
    
    # ─────────────────────────────────────────────────────────────────
    # Feature Access Control
    # ─────────────────────────────────────────────────────────────────
    
    async def check_feature_access(
        self,
        user: User,
        feature: str,
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if user can access a feature.
        
        Returns:
            Tuple of (has_access, reason_if_denied)
        """
        status = await self.get_subscription_status(user)
        
        if status.can_access_premium:
            return True, None
        
        # Check specific feature limits
        if feature == "create_card":
            if status.cards_limit and status.cards_used >= status.cards_limit:
                return False, f"Card limit reached ({status.cards_limit} cards)"
        
        elif feature == "take_quiz":
            if status.quizzes_limit and status.quizzes_today >= status.quizzes_limit:
                return False, f"Daily quiz limit reached ({status.quizzes_limit}/day)"
        
        elif feature == "full_instrument_details":
            limits = self._get_limits_for_tier(status.tier)
            if not limits.show_full_instrument_details:
                return False, "Full instrument details require premium"
        
        elif feature in ["unlimited_cards", "unlimited_quizzes", "unlimited_flashcards", "ad_free"]:
            return False, "This feature requires premium"
        
        return True, None
    
    # ─────────────────────────────────────────────────────────────────
    # Restore Purchases
    # ─────────────────────────────────────────────────────────────────
    
    async def restore_purchases(
        self,
        user: User,
    ) -> Tuple[bool, str]:
        """
        Attempt to restore purchases for a user.
        
        Returns:
            Tuple of (found, message)
        """
        if not user.stripe_customer_id:
            return False, "No previous purchases found for this account"
        
        try:
            # Check for active subscriptions
            subscriptions = stripe.Subscription.list(
                customer=user.stripe_customer_id,
                status="active",
                limit=1,
            )
            
            if subscriptions.data:
                subscription = subscriptions.data[0]
                
                # Update user
                user.stripe_subscription_id = subscription.id
                user.subscription_tier = SubscriptionTier.PREMIUM
                user.subscription_status = SubscriptionStatus.ACTIVE
                user.subscription_expires_at = datetime.fromtimestamp(
                    subscription.current_period_end,
                    tz=timezone.utc
                )
                await self.db.commit()
                
                return True, "Subscription restored successfully"
            
            return False, "No active subscription found"
            
        except stripe.error.StripeError as e:
            return False, f"Error checking purchases: {str(e)}"
    
    # ─────────────────────────────────────────────────────────────────
    # Plan Information
    # ─────────────────────────────────────────────────────────────────
    
    def get_available_plans(self) -> list[SubscriptionPlanInfo]:
        """Get available subscription plans."""
        return [
            SubscriptionPlanInfo(
                id="monthly",
                name="Monthly Premium",
                price=4.99,
                interval="month",
                price_id=PriceIds.get_monthly(),
                description="Full access to all premium features",
                savings_percent=None,
            ),
            SubscriptionPlanInfo(
                id="annual",
                name="Annual Premium",
                price=29.99,
                interval="year",
                price_id=PriceIds.get_annual(),
                description="Best value - save 50% with annual billing",
                savings_percent=50,
            ),
        ]
