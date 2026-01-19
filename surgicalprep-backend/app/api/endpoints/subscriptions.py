"""
Subscription API endpoints.
"""
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.stripe_config import get_stripe_settings, SubscriptionTier
from app.db.database import get_db
from app.db.models import User, SubscriptionEvent
from app.api.deps import get_current_user
from app.services.subscription_service import SubscriptionService
from app.schemas.subscription import (
    CreateCheckoutSessionRequest,
    CreatePortalSessionRequest,
    CheckoutSessionResponse,
    PortalSessionResponse,
    SubscriptionStatusResponse,
    AvailablePlansResponse,
    RestorePurchasesRequest,
    RestorePurchasesResponse,
    FeatureAccessResponse,
    PremiumRequiredError,
)


router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# ─────────────────────────────────────────────────────────────────────────────
# Checkout & Portal
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/create-checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a Stripe checkout session for subscription purchase.
    
    Returns a URL to redirect the user to Stripe's hosted checkout page.
    """
    service = SubscriptionService(db)
    
    try:
        checkout_url, session_id = await service.create_checkout_session(
            user=current_user,
            plan=request.plan,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )
        
        return CheckoutSessionResponse(
            checkout_url=checkout_url,
            session_id=session_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@router.post("/portal", response_model=PortalSessionResponse)
async def create_portal_session(
    request: CreatePortalSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a Stripe customer portal session.
    
    The portal allows customers to manage their subscription:
    - View billing history
    - Update payment method
    - Cancel subscription
    - Change plan
    """
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No subscription found. Please subscribe first."
        )
    
    service = SubscriptionService(db)
    
    try:
        portal_url = await service.create_portal_session(
            user=current_user,
            return_url=request.return_url,
        )
        
        return PortalSessionResponse(portal_url=portal_url)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# Status & Plans
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current subscription status for the authenticated user.
    
    Returns:
    - Current tier (free/premium)
    - Subscription status
    - Expiration date
    - Usage statistics and limits
    """
    service = SubscriptionService(db)
    return await service.get_subscription_status(current_user)


@router.get("/plans", response_model=AvailablePlansResponse)
async def get_available_plans(
    db: AsyncSession = Depends(get_db),
):
    """
    Get available subscription plans.
    
    Returns list of plans with pricing and features.
    """
    service = SubscriptionService(db)
    plans = service.get_available_plans()
    return AvailablePlansResponse(plans=plans)


# ─────────────────────────────────────────────────────────────────────────────
# Feature Access
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/check-access/{feature}", response_model=FeatureAccessResponse)
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Check if user has access to a specific feature.
    
    Features:
    - create_card
    - take_quiz
    - full_instrument_details
    - unlimited_cards
    - unlimited_quizzes
    - unlimited_flashcards
    - ad_free
    """
    service = SubscriptionService(db)
    has_access, reason = await service.check_feature_access(current_user, feature)
    
    return FeatureAccessResponse(
        has_access=has_access,
        feature=feature,
        reason=reason if not has_access else None,
        upgrade_url="/subscription/upgrade" if not has_access else None,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Restore Purchases
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/restore", response_model=RestorePurchasesResponse)
async def restore_purchases(
    request: RestorePurchasesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Attempt to restore previous purchases.
    
    Checks Stripe for any active subscriptions associated with the user's
    customer ID and restores access if found.
    """
    service = SubscriptionService(db)
    found, message = await service.restore_purchases(current_user)
    
    subscription_status = None
    if found:
        subscription_status = await service.get_subscription_status(current_user)
    
    return RestorePurchasesResponse(
        found=found,
        message=message,
        subscription_status=subscription_status,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Webhook
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Stripe webhook events.
    
    This endpoint receives events from Stripe about subscription changes:
    - checkout.session.completed
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
    """
    settings = get_stripe_settings()
    
    # Get raw body
    body = await request.body()
    
    # Verify signature
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    try:
        event = stripe.Webhook.construct_event(
            body,
            stripe_signature,
            settings.stripe_webhook_secret,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Log event
    subscription_event = SubscriptionEvent(
        event_type=event.type,
        stripe_event_id=event.id,
        data=event.data.object.to_dict() if hasattr(event.data.object, 'to_dict') else dict(event.data.object),
    )
    db.add(subscription_event)
    
    # Process event
    service = SubscriptionService(db)
    
    try:
        if event.type == "checkout.session.completed":
            session = event.data.object
            if session.mode == "subscription":
                await service.handle_checkout_completed(session)
        
        elif event.type == "customer.subscription.updated":
            subscription = event.data.object
            await service.handle_subscription_updated(subscription)
        
        elif event.type == "customer.subscription.deleted":
            subscription = event.data.object
            await service.handle_subscription_deleted(subscription)
        
        elif event.type == "invoice.payment_succeeded":
            invoice = event.data.object
            await service.handle_invoice_payment_succeeded(invoice)
        
        elif event.type == "invoice.payment_failed":
            invoice = event.data.object
            await service.handle_invoice_payment_failed(invoice)
        
        await db.commit()
        
    except Exception as e:
        # Log error but return 200 to prevent Stripe retries
        print(f"Webhook processing error: {e}")
        await db.rollback()
    
    return {"status": "received"}


# ─────────────────────────────────────────────────────────────────────────────
# Dependency for Premium-Gated Endpoints
# ─────────────────────────────────────────────────────────────────────────────

async def require_premium(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that requires premium subscription.
    
    Use this as a dependency for endpoints that require premium access:
    
    @router.get("/premium-only")
    async def premium_endpoint(user: User = Depends(require_premium)):
        ...
    """
    if current_user.subscription_tier != SubscriptionTier.PREMIUM:
        raise HTTPException(
            status_code=403,
            detail=PremiumRequiredError(
                feature="premium_endpoint",
                message="This endpoint requires a premium subscription",
            ).model_dump(),
        )
    return current_user


def require_feature(feature: str):
    """
    Dependency factory for feature-specific access control.
    
    Use this for endpoints that check specific feature access:
    
    @router.post("/cards")
    async def create_card(user: User = Depends(require_feature("create_card"))):
        ...
    """
    async def dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        service = SubscriptionService(db)
        has_access, reason = await service.check_feature_access(current_user, feature)
        
        if not has_access:
            raise HTTPException(
                status_code=403,
                detail=PremiumRequiredError(
                    feature=feature,
                    message=reason or "Premium subscription required",
                ).model_dump(),
            )
        return current_user
    
    return dependency
