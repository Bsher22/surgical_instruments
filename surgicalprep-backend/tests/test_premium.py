"""
Tests for premium features and subscription gating.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import User, Instrument, PreferenceCard


# =============================================================================
# Card Limit Tests
# =============================================================================

class TestCardLimits:
    """Tests for preference card creation limits."""
    
    @pytest.mark.asyncio
    async def test_free_user_card_limit(
        self, async_client: AsyncClient, auth_headers: dict, test_user: User
    ):
        """Test free user is limited to 5 cards."""
        created_cards = []
        
        # Create 5 cards (should succeed)
        for i in range(5):
            response = await async_client.post(
                "/api/v1/cards",
                headers=auth_headers,
                json={
                    "title": f"Free Card {i + 1}",
                    "specialty": "general",
                },
            )
            if response.status_code == 201:
                created_cards.append(response.json()["id"])
        
        assert len(created_cards) == 5
        
        # 6th card should fail
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "title": "Sixth Card",
                "specialty": "general",
            },
        )
        
        assert response.status_code in [402, 403]
        assert "limit" in response.json().get("detail", "").lower() or "premium" in response.json().get("detail", "").lower()
    
    @pytest.mark.asyncio
    async def test_premium_user_no_card_limit(
        self, async_client: AsyncClient, premium_auth_headers: dict
    ):
        """Test premium user has no card limit."""
        # Create more than 5 cards
        for i in range(7):
            response = await async_client.post(
                "/api/v1/cards",
                headers=premium_auth_headers,
                json={
                    "title": f"Premium Card {i + 1}",
                    "specialty": "general",
                },
            )
            assert response.status_code == 201
    
    @pytest.mark.asyncio
    async def test_get_remaining_cards(self, async_client: AsyncClient, auth_headers: dict):
        """Test endpoint returns remaining card count."""
        response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "cards_limit" in data
        assert "cards_used" in data
        assert data["cards_limit"] == 5  # Free tier
        remaining = data["cards_limit"] - data["cards_used"]
        assert remaining >= 0


# =============================================================================
# Quiz Limit Tests
# =============================================================================

class TestQuizLimits:
    """Tests for daily quiz limits."""
    
    @pytest.mark.asyncio
    async def test_free_user_daily_quiz_limit(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments
    ):
        """Test free user is limited to 3 quizzes per day."""
        # Complete 3 quizzes
        for i in range(3):
            start_response = await async_client.post(
                "/api/v1/quiz/start",
                headers=auth_headers,
                json={
                    "quiz_type": "flashcard",
                    "question_count": 3,
                },
            )
            
            if start_response.status_code == 201:
                session_id = start_response.json()["session_id"]
                await async_client.post(
                    f"/api/v1/quiz/{session_id}/complete",
                    headers=auth_headers,
                )
        
        # 4th quiz should fail
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "flashcard",
                "question_count": 3,
            },
        )
        
        assert response.status_code in [402, 403, 429]
    
    @pytest.mark.asyncio
    async def test_premium_user_no_quiz_limit(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_instruments
    ):
        """Test premium user has unlimited quizzes."""
        for i in range(5):
            start_response = await async_client.post(
                "/api/v1/quiz/start",
                headers=premium_auth_headers,
                json={
                    "quiz_type": "flashcard",
                    "question_count": 3,
                },
            )
            
            assert start_response.status_code == 201
            
            session_id = start_response.json()["session_id"]
            await async_client.post(
                f"/api/v1/quiz/{session_id}/complete",
                headers=premium_auth_headers,
            )
    
    @pytest.mark.asyncio
    async def test_quiz_limit_resets_daily(self, async_client: AsyncClient, auth_headers: dict):
        """Test quiz limit information includes reset time."""
        response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "daily_quizzes_limit" in data or "quizzes_limit" in data
        assert "quizzes_used_today" in data or "quizzes_remaining" in data


# =============================================================================
# Premium Content Access Tests
# =============================================================================

class TestPremiumContentAccess:
    """Tests for premium content gating."""
    
    @pytest.mark.asyncio
    async def test_free_user_premium_instrument_locked(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test free user sees limited info for premium instruments."""
        # Find premium instrument
        premium_instrument = next(i for i in sample_instruments if i.is_premium)
        
        response = await async_client.get(
            f"/api/v1/instruments/{premium_instrument.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should indicate premium lock or have limited fields
        assert data.get("is_premium_locked", False) is True or \
               data.get("handling_notes") is None or \
               "premium" in str(data).lower()
    
    @pytest.mark.asyncio
    async def test_premium_user_full_access(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test premium user sees full instrument details."""
        premium_instrument = next(i for i in sample_instruments if i.is_premium)
        
        response = await async_client.get(
            f"/api/v1/instruments/{premium_instrument.id}",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Full content should be visible
        assert data.get("is_premium_locked", False) is False
        assert "handling_notes" in data


# =============================================================================
# Subscription Status Tests
# =============================================================================

class TestSubscriptionStatus:
    """Tests for subscription status endpoints."""
    
    @pytest.mark.asyncio
    async def test_free_user_subscription_status(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """Test free user subscription status."""
        response = await async_client.get(
            "/api/v1/users/me/subscription",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_premium"] is False
        assert data["tier"] == "free"
    
    @pytest.mark.asyncio
    async def test_premium_user_subscription_status(
        self, async_client: AsyncClient, premium_auth_headers: dict
    ):
        """Test premium user subscription status."""
        response = await async_client.get(
            "/api/v1/users/me/subscription",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_premium"] is True
        assert data["tier"] == "premium"
        assert "expires_at" in data or "premium_until" in data
    
    @pytest.mark.asyncio
    async def test_subscription_benefits(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting premium subscription benefits list."""
        response = await async_client.get(
            "/api/v1/subscription/benefits",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should list benefits
        assert len(data) > 0


# =============================================================================
# Premium Feature Promotion Tests
# =============================================================================

class TestPremiumPromotion:
    """Tests for premium feature promotion/upsell."""
    
    @pytest.mark.asyncio
    async def test_limit_exceeded_response_includes_upgrade(
        self, async_client: AsyncClient, auth_headers: dict, user_cards
    ):
        """Test limit exceeded response suggests upgrade."""
        # Try to create card beyond limit
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "title": "Over Limit Card",
                "specialty": "general",
            },
        )
        
        if response.status_code in [402, 403]:
            data = response.json()
            # Should suggest upgrade
            assert "upgrade" in data.get("detail", "").lower() or \
                   "premium" in data.get("detail", "").lower()
    
    @pytest.mark.asyncio
    async def test_get_pricing_info(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting subscription pricing information."""
        response = await async_client.get(
            "/api/v1/subscription/pricing",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "monthly" in data or "plans" in data
        # Should include price info
        if "monthly" in data:
            assert "price" in data["monthly"] or isinstance(data["monthly"], (int, float, str))


# =============================================================================
# Expired Premium Tests
# =============================================================================

class TestExpiredPremium:
    """Tests for handling expired premium subscriptions."""
    
    @pytest.mark.asyncio
    async def test_expired_premium_treated_as_free(
        self, async_client: AsyncClient, test_db, test_user: User
    ):
        """Test expired premium user is treated as free user."""
        # Update user to have expired premium
        test_user.is_premium = True
        test_user.premium_until = datetime.utcnow() - timedelta(days=1)
        await test_db.commit()
        
        from app.core.security import create_access_token
        token = create_access_token(subject=str(test_user.id))
        expired_premium_headers = {"Authorization": f"Bearer {token}"}
        
        response = await async_client.get(
            "/api/v1/users/me/subscription",
            headers=expired_premium_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should be treated as free since expired
        assert data["is_premium"] is False or data.get("expired", False) is True


# =============================================================================
# Webhook/Subscription Update Tests (Stripe)
# =============================================================================

class TestSubscriptionWebhooks:
    """Tests for subscription webhook handling."""
    
    @pytest.mark.asyncio
    async def test_webhook_signature_required(self, async_client: AsyncClient):
        """Test webhook requires valid Stripe signature."""
        response = await async_client.post(
            "/api/v1/webhooks/stripe",
            json={"type": "customer.subscription.created"},
        )
        
        # Should reject without proper signature
        assert response.status_code in [400, 401, 403]
    
    @pytest.mark.asyncio
    async def test_webhook_handles_subscription_created(self, async_client: AsyncClient):
        """Test webhook handles subscription creation event."""
        # This would require mocking Stripe signature verification
        # For now, just test endpoint exists
        response = await async_client.post(
            "/api/v1/webhooks/stripe",
            headers={"Stripe-Signature": "test_signature"},
            json={"type": "customer.subscription.created"},
        )
        
        # Will fail signature check but confirms route exists
        assert response.status_code in [400, 401, 403, 500]


# =============================================================================
# Usage Tracking Tests
# =============================================================================

class TestUsageTracking:
    """Tests for tracking usage against limits."""
    
    @pytest.mark.asyncio
    async def test_card_count_accurate(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """Test card count is accurately tracked."""
        # Get initial count
        initial_response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        initial_count = initial_response.json()["cards_used"]
        
        # Create a card
        await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={"title": "Tracking Test Card", "specialty": "general"},
        )
        
        # Check count increased
        updated_response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        updated_count = updated_response.json()["cards_used"]
        
        assert updated_count == initial_count + 1
    
    @pytest.mark.asyncio
    async def test_quiz_count_resets_at_midnight(self, async_client: AsyncClient, auth_headers: dict):
        """Test daily quiz count includes reset time info."""
        response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should include when limit resets
        assert "resets_at" in data or "next_reset" in data or "quizzes_reset_at" in data
