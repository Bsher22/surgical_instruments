"""
Tests for preference card endpoints.
"""
import pytest
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import PreferenceCard, Instrument, User


# =============================================================================
# List Cards Tests
# =============================================================================

class TestListCards:
    """Tests for listing preference cards."""
    
    @pytest.mark.asyncio
    async def test_list_cards_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test listing user's preference cards."""
        response = await async_client.get(
            "/api/v1/cards",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_list_cards_only_own(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard, premium_user: User
    ):
        """Test users only see their own cards."""
        response = await async_client.get(
            "/api/v1/cards",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # All returned cards should belong to the test user
        for card in data["items"]:
            # Card should not belong to premium_user
            assert card.get("user_id") != str(premium_user.id)
    
    @pytest.mark.asyncio
    async def test_list_cards_search_by_title(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test searching cards by title."""
        response = await async_client.get(
            "/api/v1/cards",
            headers=auth_headers,
            params={"search": "Cholecystectomy"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_list_cards_filter_by_specialty(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test filtering cards by specialty."""
        response = await async_client.get(
            "/api/v1/cards",
            headers=auth_headers,
            params={"specialty": "general"},
        )
        
        assert response.status_code == 200
        data = response.json()
        for card in data["items"]:
            assert card["specialty"] == "general"
    
    @pytest.mark.asyncio
    async def test_list_cards_unauthorized(self, async_client: AsyncClient):
        """Test listing cards without auth fails."""
        response = await async_client.get("/api/v1/cards")
        
        assert response.status_code == 401


# =============================================================================
# Get Single Card Tests
# =============================================================================

class TestGetCard:
    """Tests for getting a single preference card."""
    
    @pytest.mark.asyncio
    async def test_get_card_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test getting a single card by ID."""
        response = await async_client.get(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_card.id)
        assert data["title"] == sample_card.title
        assert "items" in data
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_get_card_not_found(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting non-existent card returns 404."""
        fake_id = uuid4()
        response = await async_client.get(
            f"/api/v1/cards/{fake_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_get_card_other_user(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test getting another user's card fails."""
        response = await async_client.get(
            f"/api/v1/cards/{sample_card.id}",
            headers=premium_auth_headers,
        )
        
        # Should be 404 (not found) or 403 (forbidden)
        assert response.status_code in [403, 404]


# =============================================================================
# Create Card Tests
# =============================================================================

class TestCreateCard:
    """Tests for creating preference cards."""
    
    @pytest.mark.asyncio
    async def test_create_card_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test creating a new preference card."""
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "title": "New Test Card",
                "surgeon_name": "Dr. Test",
                "procedure_name": "Test Procedure",
                "specialty": "orthopedic",
                "general_notes": "Test notes",
                "items": [
                    {
                        "instrument_id": str(sample_instruments[0].id),
                        "quantity": 1,
                        "category": "instruments",
                    }
                ],
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Test Card"
        assert len(data["items"]) == 1
    
    @pytest.mark.asyncio
    async def test_create_card_with_custom_item(self, async_client: AsyncClient, auth_headers: dict):
        """Test creating card with custom (non-database) item."""
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "title": "Card with Custom Item",
                "specialty": "general",
                "items": [
                    {
                        "custom_name": "Custom Supply Item",
                        "quantity": 5,
                        "size": "Large",
                        "category": "supplies",
                    }
                ],
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["custom_name"] == "Custom Supply Item"
    
    @pytest.mark.asyncio
    async def test_create_card_missing_title(self, async_client: AsyncClient, auth_headers: dict):
        """Test creating card without title fails."""
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "specialty": "general",
            },
        )
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_create_card_free_tier_limit(
        self, async_client: AsyncClient, auth_headers: dict, user_cards: list[PreferenceCard]
    ):
        """Test free user cannot create more than 5 cards."""
        # user_cards fixture already has 5 cards
        response = await async_client.post(
            "/api/v1/cards",
            headers=auth_headers,
            json={
                "title": "Sixth Card (Should Fail)",
                "specialty": "general",
            },
        )
        
        # Should be 403 (limit reached) or 402 (payment required)
        assert response.status_code in [402, 403]
    
    @pytest.mark.asyncio
    async def test_create_card_premium_no_limit(
        self, async_client: AsyncClient, premium_auth_headers: dict
    ):
        """Test premium user has no card limit."""
        # Create multiple cards
        for i in range(6):
            response = await async_client.post(
                "/api/v1/cards",
                headers=premium_auth_headers,
                json={
                    "title": f"Premium Card {i + 1}",
                    "specialty": "general",
                },
            )
            assert response.status_code == 201


# =============================================================================
# Update Card Tests
# =============================================================================

class TestUpdateCard:
    """Tests for updating preference cards."""
    
    @pytest.mark.asyncio
    async def test_update_card_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test updating a preference card."""
        response = await async_client.put(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
            json={
                "title": "Updated Card Title",
                "surgeon_name": sample_card.surgeon_name,
                "specialty": sample_card.specialty,
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Card Title"
    
    @pytest.mark.asyncio
    async def test_update_card_partial(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test partial card update with PATCH."""
        response = await async_client.patch(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
            json={
                "general_notes": "Updated notes only",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["general_notes"] == "Updated notes only"
        assert data["title"] == sample_card.title  # Unchanged
    
    @pytest.mark.asyncio
    async def test_update_card_items(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard, sample_instruments: list[Instrument]
    ):
        """Test updating card items."""
        response = await async_client.put(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
            json={
                "title": sample_card.title,
                "specialty": sample_card.specialty,
                "items": [
                    {
                        "instrument_id": str(sample_instruments[2].id),
                        "quantity": 3,
                        "category": "instruments",
                    },
                ],
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
    
    @pytest.mark.asyncio
    async def test_update_card_other_user(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test updating another user's card fails."""
        response = await async_client.put(
            f"/api/v1/cards/{sample_card.id}",
            headers=premium_auth_headers,
            json={
                "title": "Hacked Title",
                "specialty": "general",
            },
        )
        
        assert response.status_code in [403, 404]
    
    @pytest.mark.asyncio
    async def test_update_card_not_found(self, async_client: AsyncClient, auth_headers: dict):
        """Test updating non-existent card fails."""
        fake_id = uuid4()
        response = await async_client.put(
            f"/api/v1/cards/{fake_id}",
            headers=auth_headers,
            json={
                "title": "Test",
                "specialty": "general",
            },
        )
        
        assert response.status_code == 404


# =============================================================================
# Delete Card Tests
# =============================================================================

class TestDeleteCard:
    """Tests for deleting preference cards."""
    
    @pytest.mark.asyncio
    async def test_delete_card_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test deleting a preference card."""
        response = await async_client.delete(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        
        # Verify card is deleted
        get_response = await async_client.get(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_card_other_user(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test deleting another user's card fails."""
        response = await async_client.delete(
            f"/api/v1/cards/{sample_card.id}",
            headers=premium_auth_headers,
        )
        
        assert response.status_code in [403, 404]
    
    @pytest.mark.asyncio
    async def test_delete_card_not_found(self, async_client: AsyncClient, auth_headers: dict):
        """Test deleting non-existent card fails."""
        fake_id = uuid4()
        response = await async_client.delete(
            f"/api/v1/cards/{fake_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 404


# =============================================================================
# Duplicate Card Tests
# =============================================================================

class TestDuplicateCard:
    """Tests for duplicating preference cards."""
    
    @pytest.mark.asyncio
    async def test_duplicate_card_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test duplicating a preference card."""
        response = await async_client.post(
            f"/api/v1/cards/{sample_card.id}/duplicate",
            headers=auth_headers,
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "(Copy)" in data["title"] or "copy" in data["title"].lower()
        assert data["id"] != str(sample_card.id)
        assert len(data["items"]) == len(sample_card.items) if hasattr(sample_card, 'items') else True
    
    @pytest.mark.asyncio
    async def test_duplicate_template_card(
        self, async_client: AsyncClient, auth_headers: dict, template_card: PreferenceCard
    ):
        """Test duplicating a template card."""
        response = await async_client.post(
            f"/api/v1/cards/{template_card.id}/duplicate",
            headers=auth_headers,
        )
        
        assert response.status_code == 201
        data = response.json()
        # Duplicated card should not be a template
        assert data["is_template"] is False
    
    @pytest.mark.asyncio
    async def test_duplicate_card_respects_limit(
        self, async_client: AsyncClient, auth_headers: dict, user_cards: list[PreferenceCard]
    ):
        """Test duplicating respects free tier card limit."""
        # user_cards has 5 cards, duplicating should fail for free user
        response = await async_client.post(
            f"/api/v1/cards/{user_cards[0].id}/duplicate",
            headers=auth_headers,
        )
        
        assert response.status_code in [402, 403]


# =============================================================================
# Card Templates Tests
# =============================================================================

class TestCardTemplates:
    """Tests for card template functionality."""
    
    @pytest.mark.asyncio
    async def test_list_templates(
        self, async_client: AsyncClient, auth_headers: dict, template_card: PreferenceCard
    ):
        """Test listing available templates."""
        response = await async_client.get(
            "/api/v1/cards/templates",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        for template in data["items"]:
            assert template["is_template"] is True
    
    @pytest.mark.asyncio
    async def test_get_template(
        self, async_client: AsyncClient, auth_headers: dict, template_card: PreferenceCard
    ):
        """Test getting a specific template."""
        response = await async_client.get(
            f"/api/v1/cards/templates/{template_card.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_template"] is True


# =============================================================================
# Card Photos Tests
# =============================================================================

class TestCardPhotos:
    """Tests for card photo upload functionality."""
    
    @pytest.mark.asyncio
    async def test_upload_photo(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test uploading a photo to a card."""
        # Create a simple test image (1x1 pixel PNG)
        import base64
        # Minimal valid PNG
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        response = await async_client.post(
            f"/api/v1/cards/{sample_card.id}/photos",
            headers=auth_headers,
            files={"file": ("test.png", png_data, "image/png")},
        )
        
        assert response.status_code in [200, 201]
        data = response.json()
        assert "url" in data or "photo_url" in data
    
    @pytest.mark.asyncio
    async def test_delete_photo(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test deleting a photo from a card."""
        # First upload a photo
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        upload_response = await async_client.post(
            f"/api/v1/cards/{sample_card.id}/photos",
            headers=auth_headers,
            files={"file": ("test.png", png_data, "image/png")},
        )
        
        if upload_response.status_code in [200, 201]:
            photo_id = upload_response.json().get("id") or upload_response.json().get("photo_id")
            
            if photo_id:
                # Delete the photo
                response = await async_client.delete(
                    f"/api/v1/cards/{sample_card.id}/photos/{photo_id}",
                    headers=auth_headers,
                )
                
                assert response.status_code == 200


# =============================================================================
# Card Item Reordering Tests
# =============================================================================

class TestCardItemReorder:
    """Tests for reordering card items."""
    
    @pytest.mark.asyncio
    async def test_reorder_items(
        self, async_client: AsyncClient, auth_headers: dict, sample_card: PreferenceCard
    ):
        """Test reordering items in a card."""
        # Get current items
        get_response = await async_client.get(
            f"/api/v1/cards/{sample_card.id}",
            headers=auth_headers,
        )
        items = get_response.json()["items"]
        
        if len(items) >= 2:
            # Reverse the order
            new_order = [item["id"] for item in reversed(items)]
            
            response = await async_client.put(
                f"/api/v1/cards/{sample_card.id}/items/reorder",
                headers=auth_headers,
                json={"item_ids": new_order},
            )
            
            assert response.status_code == 200
