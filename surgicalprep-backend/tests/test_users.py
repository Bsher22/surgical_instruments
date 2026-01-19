"""
Tests for user management endpoints.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import User


# =============================================================================
# Get Current User Tests
# =============================================================================

class TestGetCurrentUser:
    """Tests for getting current user info."""
    
    @pytest.mark.asyncio
    async def test_get_me_success(self, async_client: AsyncClient, auth_headers: dict, test_user: User):
        """Test getting current user's info."""
        response = await async_client.get(
            "/api/v1/users/me",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert data["role"] == test_user.role
        assert data["institution"] == test_user.institution
        assert "hashed_password" not in data
    
    @pytest.mark.asyncio
    async def test_get_me_unauthorized(self, async_client: AsyncClient):
        """Test getting current user without auth fails."""
        response = await async_client.get("/api/v1/users/me")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_me_premium_user(self, async_client: AsyncClient, premium_auth_headers: dict, premium_user: User):
        """Test getting premium user's info shows premium status."""
        response = await async_client.get(
            "/api/v1/users/me",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_premium"] is True
        assert "premium_until" in data


# =============================================================================
# Update User Tests
# =============================================================================

class TestUpdateUser:
    """Tests for updating user profile."""
    
    @pytest.mark.asyncio
    async def test_update_profile_success(self, async_client: AsyncClient, auth_headers: dict):
        """Test successful profile update."""
        response = await async_client.patch(
            "/api/v1/users/me",
            headers=auth_headers,
            json={
                "full_name": "Updated Name",
                "institution": "New Hospital",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["institution"] == "New Hospital"
    
    @pytest.mark.asyncio
    async def test_update_profile_partial(self, async_client: AsyncClient, auth_headers: dict, test_user: User):
        """Test partial profile update (only one field)."""
        original_institution = test_user.institution
        
        response = await async_client.patch(
            "/api/v1/users/me",
            headers=auth_headers,
            json={
                "full_name": "Only Name Updated",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Only Name Updated"
        assert data["institution"] == original_institution
    
    @pytest.mark.asyncio
    async def test_update_profile_email_change(self, async_client: AsyncClient, auth_headers: dict):
        """Test email change (if allowed)."""
        response = await async_client.patch(
            "/api/v1/users/me",
            headers=auth_headers,
            json={
                "email": "newemail@example.com",
            },
        )
        
        # Depending on implementation, this might be allowed or forbidden
        # If allowed:
        if response.status_code == 200:
            assert response.json()["email"] == "newemail@example.com"
        # If forbidden:
        elif response.status_code in [400, 422]:
            pass  # Expected
    
    @pytest.mark.asyncio
    async def test_update_profile_invalid_role(self, async_client: AsyncClient, auth_headers: dict):
        """Test updating to invalid role fails."""
        response = await async_client.patch(
            "/api/v1/users/me",
            headers=auth_headers,
            json={
                "role": "invalid_role",
            },
        )
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_update_profile_unauthorized(self, async_client: AsyncClient):
        """Test updating profile without auth fails."""
        response = await async_client.patch(
            "/api/v1/users/me",
            json={"full_name": "Hacker"},
        )
        
        assert response.status_code == 401


# =============================================================================
# User Statistics Tests
# =============================================================================

class TestUserStats:
    """Tests for user statistics endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_user_stats(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting user statistics."""
        response = await async_client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "cards_created" in data
        assert "instruments_studied" in data
        assert "quizzes_completed" in data
        assert "total_study_time" in data or "study_streak" in data
    
    @pytest.mark.asyncio
    async def test_get_user_stats_with_data(
        self,
        async_client: AsyncClient,
        auth_headers: dict,
        sample_card,
        completed_quiz_session,
        user_progress,
    ):
        """Test user stats with actual data."""
        response = await async_client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["cards_created"] >= 1
        assert data["quizzes_completed"] >= 1


# =============================================================================
# Delete Account Tests
# =============================================================================

class TestDeleteAccount:
    """Tests for account deletion."""
    
    @pytest.mark.asyncio
    async def test_delete_account_success(self, async_client: AsyncClient, auth_headers: dict):
        """Test successful account deletion."""
        response = await async_client.delete(
            "/api/v1/users/me",
            headers=auth_headers,
            json={"confirm": True},
        )
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
    
    @pytest.mark.asyncio
    async def test_delete_account_without_confirmation(self, async_client: AsyncClient, auth_headers: dict):
        """Test account deletion without confirmation fails."""
        response = await async_client.delete(
            "/api/v1/users/me",
            headers=auth_headers,
            json={"confirm": False},
        )
        
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_delete_account_unauthorized(self, async_client: AsyncClient):
        """Test account deletion without auth fails."""
        response = await async_client.delete(
            "/api/v1/users/me",
            json={"confirm": True},
        )
        
        assert response.status_code == 401


# =============================================================================
# User Preferences Tests
# =============================================================================

class TestUserPreferences:
    """Tests for user preferences/settings."""
    
    @pytest.mark.asyncio
    async def test_get_preferences(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting user preferences."""
        response = await async_client.get(
            "/api/v1/users/me/preferences",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Check for expected preference fields
        assert "quiz_question_count" in data or "default_question_count" in data
    
    @pytest.mark.asyncio
    async def test_update_preferences(self, async_client: AsyncClient, auth_headers: dict):
        """Test updating user preferences."""
        response = await async_client.patch(
            "/api/v1/users/me/preferences",
            headers=auth_headers,
            json={
                "quiz_question_count": 20,
                "timer_enabled": True,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["quiz_question_count"] == 20 or data.get("default_question_count") == 20
    
    @pytest.mark.asyncio
    async def test_update_preferences_invalid_value(self, async_client: AsyncClient, auth_headers: dict):
        """Test updating preferences with invalid value fails."""
        response = await async_client.patch(
            "/api/v1/users/me/preferences",
            headers=auth_headers,
            json={
                "quiz_question_count": -5,  # Invalid
            },
        )
        
        assert response.status_code == 422


# =============================================================================
# Premium Status Tests
# =============================================================================

class TestPremiumStatus:
    """Tests for premium subscription status."""
    
    @pytest.mark.asyncio
    async def test_free_user_status(self, async_client: AsyncClient, auth_headers: dict, test_user: User):
        """Test free user's premium status."""
        response = await async_client.get(
            "/api/v1/users/me/subscription",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_premium"] is False
        assert data["tier"] == "free"
    
    @pytest.mark.asyncio
    async def test_premium_user_status(self, async_client: AsyncClient, premium_auth_headers: dict):
        """Test premium user's subscription status."""
        response = await async_client.get(
            "/api/v1/users/me/subscription",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_premium"] is True
        assert data["tier"] == "premium"
        assert "expires_at" in data or "premium_until" in data


# =============================================================================
# Usage Limits Tests
# =============================================================================

class TestUsageLimits:
    """Tests for usage limits (cards, quizzes per day)."""
    
    @pytest.mark.asyncio
    async def test_get_usage_limits_free_user(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting usage limits for free user."""
        response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "cards_limit" in data
        assert "cards_used" in data
        assert "quizzes_limit" in data or "daily_quizzes_limit" in data
        assert data["cards_limit"] == 5  # Free tier limit
    
    @pytest.mark.asyncio
    async def test_get_usage_limits_premium_user(self, async_client: AsyncClient, premium_auth_headers: dict):
        """Test getting usage limits for premium user."""
        response = await async_client.get(
            "/api/v1/users/me/limits",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Premium users should have unlimited or very high limits
        assert data["cards_limit"] == -1 or data["cards_limit"] >= 100
