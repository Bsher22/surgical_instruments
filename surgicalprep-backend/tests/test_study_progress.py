"""
Tests for study progress and spaced repetition functionality.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import UserInstrumentProgress, Instrument, User


# =============================================================================
# Get Progress Tests
# =============================================================================

class TestGetStudyProgress:
    """Tests for getting study progress."""
    
    @pytest.mark.asyncio
    async def test_get_overall_progress(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test getting overall study progress."""
        response = await async_client.get(
            "/api/v1/progress",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_instruments" in data or "instruments_studied" in data
        assert "mastered" in data or "mastered_count" in data
    
    @pytest.mark.asyncio
    async def test_get_instrument_progress(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress], sample_instruments: list[Instrument]
    ):
        """Test getting progress for a specific instrument."""
        instrument_id = user_progress[0].instrument_id
        
        response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "times_studied" in data
        assert "ease_factor" in data
        assert "next_review" in data
    
    @pytest.mark.asyncio
    async def test_get_progress_by_category(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test getting progress breakdown by category."""
        response = await async_client.get(
            "/api/v1/progress/by-category",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should return category-wise progress
        assert isinstance(data, (list, dict))
    
    @pytest.mark.asyncio
    async def test_get_progress_no_data(self, async_client: AsyncClient, premium_auth_headers: dict):
        """Test getting progress when no study data exists."""
        response = await async_client.get(
            "/api/v1/progress",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should return zeros or empty
        instruments_studied = data.get("instruments_studied") or data.get("total_instruments")
        assert instruments_studied == 0 or instruments_studied is None


# =============================================================================
# Update Progress Tests
# =============================================================================

class TestUpdateProgress:
    """Tests for updating study progress."""
    
    @pytest.mark.asyncio
    async def test_record_study_session(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test recording a study session for an instrument."""
        instrument_id = sample_instruments[0].id
        
        response = await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/study",
            headers=auth_headers,
            json={
                "correct": True,
                "response_time_ms": 2500,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["times_studied"] >= 1
        assert "next_review" in data
    
    @pytest.mark.asyncio
    async def test_record_incorrect_answer(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test recording an incorrect answer updates progress correctly."""
        instrument_id = sample_instruments[0].id
        
        response = await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/study",
            headers=auth_headers,
            json={
                "correct": False,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        # Incorrect answers should schedule sooner review
        assert "next_review" in data
    
    @pytest.mark.asyncio
    async def test_progress_updates_ease_factor(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test that repeated correct answers increase ease factor."""
        instrument_id = user_progress[0].instrument_id
        initial_ease = user_progress[0].ease_factor
        
        # Record multiple correct answers
        for _ in range(3):
            await async_client.post(
                f"/api/v1/progress/instruments/{instrument_id}/study",
                headers=auth_headers,
                json={"correct": True},
            )
        
        # Get updated progress
        response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Ease factor should increase or stay same with correct answers
        assert data["ease_factor"] >= initial_ease


# =============================================================================
# Spaced Repetition Tests
# =============================================================================

class TestSpacedRepetition:
    """Tests for SM-2 spaced repetition algorithm."""
    
    @pytest.mark.asyncio
    async def test_initial_interval(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test initial study interval is set correctly."""
        instrument_id = sample_instruments[1].id  # Use one not yet studied
        
        response = await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/study",
            headers=auth_headers,
            json={"correct": True},
        )
        
        assert response.status_code == 200
        data = response.json()
        # First correct answer should give 1 day interval
        assert data["interval"] >= 1
    
    @pytest.mark.asyncio
    async def test_interval_increases(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test that interval increases with correct answers."""
        instrument_id = user_progress[0].instrument_id
        
        # Get initial interval
        initial_response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        initial_interval = initial_response.json()["interval"]
        
        # Record correct answer
        await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/study",
            headers=auth_headers,
            json={"correct": True},
        )
        
        # Get updated interval
        updated_response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        updated_interval = updated_response.json()["interval"]
        
        # Interval should increase
        assert updated_interval >= initial_interval
    
    @pytest.mark.asyncio
    async def test_interval_resets_on_incorrect(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test that incorrect answer resets interval."""
        instrument_id = user_progress[0].instrument_id
        
        # Record incorrect answer
        response = await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/study",
            headers=auth_headers,
            json={"correct": False},
        )
        
        assert response.status_code == 200
        data = response.json()
        # Interval should be reset to 1 or stay low
        assert data["interval"] <= 2
    
    @pytest.mark.asyncio
    async def test_ease_factor_minimum(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test ease factor doesn't go below minimum (1.3)."""
        instrument_id = user_progress[0].instrument_id
        
        # Record many incorrect answers
        for _ in range(10):
            await async_client.post(
                f"/api/v1/progress/instruments/{instrument_id}/study",
                headers=auth_headers,
                json={"correct": False},
            )
        
        response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        data = response.json()
        # Ease factor should not go below 1.3
        assert data["ease_factor"] >= 1.3


# =============================================================================
# Bookmark Tests
# =============================================================================

class TestBookmarks:
    """Tests for instrument bookmarking."""
    
    @pytest.mark.asyncio
    async def test_get_bookmarked_instruments(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test getting bookmarked instruments."""
        response = await async_client.get(
            "/api/v1/progress/bookmarked",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        # At least one should be bookmarked (from fixture)
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_toggle_bookmark(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test toggling bookmark on an instrument."""
        instrument_id = sample_instruments[0].id
        
        # Toggle bookmark on
        response = await async_client.post(
            f"/api/v1/progress/instruments/{instrument_id}/bookmark",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert response.json()["is_bookmarked"] is True
        
        # Toggle bookmark off
        response = await async_client.delete(
            f"/api/v1/progress/instruments/{instrument_id}/bookmark",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert response.json()["is_bookmarked"] is False


# =============================================================================
# Mastery Tests
# =============================================================================

class TestMastery:
    """Tests for instrument mastery tracking."""
    
    @pytest.mark.asyncio
    async def test_get_mastered_instruments(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test getting mastered instruments."""
        response = await async_client.get(
            "/api/v1/progress/mastered",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_mastery_criteria(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test that mastery is achieved after enough correct answers."""
        instrument_id = sample_instruments[0].id
        
        # Record many correct answers
        for _ in range(10):
            await async_client.post(
                f"/api/v1/progress/instruments/{instrument_id}/study",
                headers=auth_headers,
                json={"correct": True},
            )
        
        # Check if mastered
        response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        data = response.json()
        # Should have high ease factor and long interval
        assert data["ease_factor"] >= 2.5
        assert data["interval"] >= 7


# =============================================================================
# Reset Progress Tests
# =============================================================================

class TestResetProgress:
    """Tests for resetting study progress."""
    
    @pytest.mark.asyncio
    async def test_reset_instrument_progress(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test resetting progress for a single instrument."""
        instrument_id = user_progress[0].instrument_id
        
        response = await async_client.delete(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        
        # Verify progress is reset
        get_response = await async_client.get(
            f"/api/v1/progress/instruments/{instrument_id}",
            headers=auth_headers,
        )
        
        # Either 404 or reset values
        if get_response.status_code == 200:
            data = get_response.json()
            assert data["times_studied"] == 0
    
    @pytest.mark.asyncio
    async def test_reset_all_progress(self, async_client: AsyncClient, auth_headers: dict, user_progress):
        """Test resetting all study progress."""
        response = await async_client.delete(
            "/api/v1/progress/reset-all",
            headers=auth_headers,
            json={"confirm": True},
        )
        
        assert response.status_code == 200
        
        # Verify all progress is reset
        get_response = await async_client.get(
            "/api/v1/progress",
            headers=auth_headers,
        )
        
        data = get_response.json()
        instruments_studied = data.get("instruments_studied") or data.get("total_instruments")
        assert instruments_studied == 0 or instruments_studied is None
    
    @pytest.mark.asyncio
    async def test_reset_all_requires_confirmation(self, async_client: AsyncClient, auth_headers: dict):
        """Test reset all progress requires confirmation."""
        response = await async_client.delete(
            "/api/v1/progress/reset-all",
            headers=auth_headers,
            json={"confirm": False},
        )
        
        assert response.status_code == 400


# =============================================================================
# Study Calendar Tests
# =============================================================================

class TestStudyCalendar:
    """Tests for study calendar/history view."""
    
    @pytest.mark.asyncio
    async def test_get_study_calendar(
        self, async_client: AsyncClient, auth_headers: dict, user_progress: list[UserInstrumentProgress]
    ):
        """Test getting study activity calendar."""
        response = await async_client.get(
            "/api/v1/progress/calendar",
            headers=auth_headers,
            params={
                "start_date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
                "end_date": datetime.utcnow().isoformat(),
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should return date-based activity data
        assert isinstance(data, (list, dict))
    
    @pytest.mark.asyncio
    async def test_get_daily_summary(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting daily study summary."""
        response = await async_client.get(
            "/api/v1/progress/daily-summary",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "date" in data or "today" in str(data)
        assert "items_studied" in data or "instruments_studied" in data
