"""
Tests for instrument endpoints.
"""
import pytest
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import Instrument, User


# =============================================================================
# List Instruments Tests
# =============================================================================

class TestListInstruments:
    """Tests for listing instruments."""
    
    @pytest.mark.asyncio
    async def test_list_instruments_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test listing instruments returns paginated results."""
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert len(data["items"]) > 0
    
    @pytest.mark.asyncio
    async def test_list_instruments_pagination(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test instrument list pagination."""
        # Get first page with size 2
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"page": 1, "size": 2},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 2
        assert data["page"] == 1
        
        # Get second page
        response2 = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"page": 2, "size": 2},
        )
        
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["page"] == 2
    
    @pytest.mark.asyncio
    async def test_list_instruments_filter_by_category(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test filtering instruments by category."""
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"category": "cutting"},
        )
        
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "cutting"
    
    @pytest.mark.asyncio
    async def test_list_instruments_search(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test searching instruments by name."""
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"search": "Mayo"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        # At least one result should contain "Mayo"
        assert any("mayo" in item["name"].lower() for item in data["items"])
    
    @pytest.mark.asyncio
    async def test_list_instruments_search_by_alias(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test searching instruments by alias."""
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"search": "Metz"},
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should find Metzenbaum Scissors by alias "Metz"
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_list_instruments_unauthorized(self, async_client: AsyncClient):
        """Test listing instruments without auth fails."""
        response = await async_client.get("/api/v1/instruments")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_list_instruments_empty_category(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test filtering by non-existent category returns empty."""
        response = await async_client.get(
            "/api/v1/instruments",
            headers=auth_headers,
            params={"category": "nonexistent_category"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0


# =============================================================================
# Get Single Instrument Tests
# =============================================================================

class TestGetInstrument:
    """Tests for getting a single instrument."""
    
    @pytest.mark.asyncio
    async def test_get_instrument_success(
        self, async_client: AsyncClient, auth_headers: dict, single_instrument: Instrument
    ):
        """Test getting a single instrument by ID."""
        response = await async_client.get(
            f"/api/v1/instruments/{single_instrument.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(single_instrument.id)
        assert data["name"] == single_instrument.name
        assert data["category"] == single_instrument.category
        assert "description" in data
        assert "primary_uses" in data
        assert "common_procedures" in data
    
    @pytest.mark.asyncio
    async def test_get_instrument_not_found(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting non-existent instrument returns 404."""
        fake_id = uuid4()
        response = await async_client.get(
            f"/api/v1/instruments/{fake_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_get_instrument_invalid_id(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting instrument with invalid ID format."""
        response = await async_client.get(
            "/api/v1/instruments/not-a-uuid",
            headers=auth_headers,
        )
        
        assert response.status_code == 422


# =============================================================================
# Premium Instrument Content Tests
# =============================================================================

class TestPremiumInstrumentContent:
    """Tests for premium instrument content gating."""
    
    @pytest.mark.asyncio
    async def test_free_user_sees_limited_premium_content(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test free user sees limited info for premium instruments."""
        # Find a premium instrument
        premium_instrument = next(i for i in sample_instruments if i.is_premium)
        
        response = await async_client.get(
            f"/api/v1/instruments/{premium_instrument.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Premium content should be gated
        assert data.get("is_premium_locked", False) or "premium" in str(data).lower()
    
    @pytest.mark.asyncio
    async def test_premium_user_sees_full_content(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test premium user sees full instrument details."""
        # Find a premium instrument
        premium_instrument = next(i for i in sample_instruments if i.is_premium)
        
        response = await async_client.get(
            f"/api/v1/instruments/{premium_instrument.id}",
            headers=premium_auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Full content should be visible
        assert data.get("is_premium_locked", False) is False or "handling_notes" in data


# =============================================================================
# Instrument Categories Tests
# =============================================================================

class TestInstrumentCategories:
    """Tests for instrument category endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_categories(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test getting list of instrument categories."""
        response = await async_client.get(
            "/api/v1/instruments/categories",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "cutting" in data
        assert "clamping" in data
    
    @pytest.mark.asyncio
    async def test_get_category_counts(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test getting instrument counts by category."""
        response = await async_client.get(
            "/api/v1/instruments/categories/counts",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should be a dict with category names as keys and counts as values
        assert isinstance(data, dict)
        assert data.get("cutting", 0) >= 1


# =============================================================================
# Bookmark Instrument Tests
# =============================================================================

class TestBookmarkInstrument:
    """Tests for bookmarking instruments."""
    
    @pytest.mark.asyncio
    async def test_bookmark_instrument(
        self, async_client: AsyncClient, auth_headers: dict, single_instrument: Instrument
    ):
        """Test bookmarking an instrument."""
        response = await async_client.post(
            f"/api/v1/instruments/{single_instrument.id}/bookmark",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_bookmarked"] is True
    
    @pytest.mark.asyncio
    async def test_unbookmark_instrument(
        self, async_client: AsyncClient, auth_headers: dict, single_instrument: Instrument
    ):
        """Test removing bookmark from an instrument."""
        # First bookmark it
        await async_client.post(
            f"/api/v1/instruments/{single_instrument.id}/bookmark",
            headers=auth_headers,
        )
        
        # Then unbookmark
        response = await async_client.delete(
            f"/api/v1/instruments/{single_instrument.id}/bookmark",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_bookmarked"] is False
    
    @pytest.mark.asyncio
    async def test_get_bookmarked_instruments(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test getting list of bookmarked instruments."""
        # Bookmark first instrument
        await async_client.post(
            f"/api/v1/instruments/{sample_instruments[0].id}/bookmark",
            headers=auth_headers,
        )
        
        response = await async_client.get(
            "/api/v1/instruments/bookmarked",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        assert any(item["id"] == str(sample_instruments[0].id) for item in data["items"])
    
    @pytest.mark.asyncio
    async def test_bookmark_nonexistent_instrument(self, async_client: AsyncClient, auth_headers: dict):
        """Test bookmarking non-existent instrument fails."""
        fake_id = uuid4()
        response = await async_client.post(
            f"/api/v1/instruments/{fake_id}/bookmark",
            headers=auth_headers,
        )
        
        assert response.status_code == 404


# =============================================================================
# Instrument Search Tests
# =============================================================================

class TestInstrumentSearch:
    """Tests for advanced instrument search."""
    
    @pytest.mark.asyncio
    async def test_full_text_search(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test full-text search across multiple fields."""
        response = await async_client.get(
            "/api/v1/instruments/search",
            headers=auth_headers,
            params={"q": "blood vessel"},
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should find Kelly Forceps (used for clamping blood vessels)
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_search_with_filters(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test search with category filter."""
        response = await async_client.get(
            "/api/v1/instruments/search",
            headers=auth_headers,
            params={"q": "scissors", "category": "cutting"},
        )
        
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "cutting"
    
    @pytest.mark.asyncio
    async def test_search_empty_query(self, async_client: AsyncClient, auth_headers: dict):
        """Test search with empty query returns all or error."""
        response = await async_client.get(
            "/api/v1/instruments/search",
            headers=auth_headers,
            params={"q": ""},
        )
        
        # Either returns all instruments or requires a query
        assert response.status_code in [200, 400, 422]
    
    @pytest.mark.asyncio
    async def test_search_no_results(self, async_client: AsyncClient, auth_headers: dict):
        """Test search with no matching results."""
        response = await async_client.get(
            "/api/v1/instruments/search",
            headers=auth_headers,
            params={"q": "xyznonexistent123"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0


# =============================================================================
# Instrument Suggestions/Autocomplete Tests
# =============================================================================

class TestInstrumentSuggestions:
    """Tests for instrument autocomplete/suggestions."""
    
    @pytest.mark.asyncio
    async def test_get_suggestions(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test getting instrument suggestions for autocomplete."""
        response = await async_client.get(
            "/api/v1/instruments/suggestions",
            headers=auth_headers,
            params={"prefix": "May"},
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should suggest "Mayo Scissors"
        assert len(data) >= 1
        assert any("mayo" in suggestion.lower() for suggestion in data)
    
    @pytest.mark.asyncio
    async def test_suggestions_limit(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test suggestions respect limit parameter."""
        response = await async_client.get(
            "/api/v1/instruments/suggestions",
            headers=auth_headers,
            params={"prefix": "M", "limit": 2},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2
