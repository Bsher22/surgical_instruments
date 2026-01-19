"""
Tests for authentication endpoints.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from httpx import AsyncClient

from app.core.security import verify_password, create_access_token, create_refresh_token
from app.db.models import User


# =============================================================================
# Registration Tests
# =============================================================================

class TestRegistration:
    """Tests for user registration endpoint."""
    
    @pytest.mark.asyncio
    async def test_register_success(self, async_client: AsyncClient):
        """Test successful user registration."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePassword123!",
                "full_name": "New User",
                "role": "surgical_tech",
                "institution": "Test Hospital",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert data["role"] == "surgical_tech"
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client: AsyncClient, test_user: User):
        """Test registration with existing email fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,  # Already exists
                "password": "AnotherPassword123!",
                "full_name": "Another User",
                "role": "student",
            },
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_register_invalid_email(self, async_client: AsyncClient):
        """Test registration with invalid email format."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "SecurePassword123!",
                "full_name": "Test User",
                "role": "surgical_tech",
            },
        )
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, async_client: AsyncClient):
        """Test registration with weak password fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "weak",  # Too short/simple
                "full_name": "Test User",
                "role": "surgical_tech",
            },
        )
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_register_missing_required_fields(self, async_client: AsyncClient):
        """Test registration with missing required fields."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                # Missing password, full_name, role
            },
        )
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_register_invalid_role(self, async_client: AsyncClient):
        """Test registration with invalid role fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePassword123!",
                "full_name": "Test User",
                "role": "invalid_role",
            },
        )
        
        assert response.status_code == 422


# =============================================================================
# Login Tests
# =============================================================================

class TestLogin:
    """Tests for user login endpoint."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, async_client: AsyncClient, test_user: User):
        """Test successful login returns tokens."""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "TestPassword123!",
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client: AsyncClient, test_user: User):
        """Test login with wrong password fails."""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "WrongPassword123!",
            },
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client: AsyncClient):
        """Test login with non-existent email fails."""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "SomePassword123!",
            },
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_inactive_user(self, async_client: AsyncClient, inactive_user: User):
        """Test login with inactive account fails."""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": inactive_user.email,
                "password": "InactivePassword123!",
            },
        )
        
        assert response.status_code == 401
        assert "inactive" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_case_insensitive_email(self, async_client: AsyncClient, test_user: User):
        """Test login with different email case works."""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email.upper(),
                "password": "TestPassword123!",
            },
        )
        
        assert response.status_code == 200


# =============================================================================
# Token Tests
# =============================================================================

class TestTokens:
    """Tests for token operations."""
    
    @pytest.mark.asyncio
    async def test_access_protected_route(self, async_client: AsyncClient, auth_headers: dict):
        """Test accessing protected route with valid token."""
        response = await async_client.get(
            "/api/v1/users/me",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_access_protected_route_no_token(self, async_client: AsyncClient):
        """Test accessing protected route without token fails."""
        response = await async_client.get("/api/v1/users/me")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_access_protected_route_invalid_token(self, async_client: AsyncClient):
        """Test accessing protected route with invalid token fails."""
        response = await async_client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid_token_here"},
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_access_protected_route_expired_token(self, async_client: AsyncClient, test_user: User):
        """Test accessing protected route with expired token fails."""
        from tests.conftest import create_test_token
        
        expired_token = create_test_token(str(test_user.id), expired=True)
        response = await async_client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_refresh_token(self, async_client: AsyncClient, test_user: User):
        """Test refreshing access token with refresh token."""
        # First, login to get tokens
        login_response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "TestPassword123!",
            },
        )
        refresh_token = login_response.json()["refresh_token"]
        
        # Use refresh token to get new access token
        response = await async_client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, async_client: AsyncClient):
        """Test refresh with invalid token fails."""
        response = await async_client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"},
        )
        
        assert response.status_code == 401


# =============================================================================
# Logout Tests
# =============================================================================

class TestLogout:
    """Tests for logout functionality."""
    
    @pytest.mark.asyncio
    async def test_logout_success(self, async_client: AsyncClient, auth_headers: dict):
        """Test successful logout."""
        response = await async_client.post(
            "/api/v1/auth/logout",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"
    
    @pytest.mark.asyncio
    async def test_logout_without_token(self, async_client: AsyncClient):
        """Test logout without token fails."""
        response = await async_client.post("/api/v1/auth/logout")
        
        assert response.status_code == 401


# =============================================================================
# Password Reset Tests
# =============================================================================

class TestPasswordReset:
    """Tests for password reset functionality."""
    
    @pytest.mark.asyncio
    async def test_request_password_reset(self, async_client: AsyncClient, test_user: User):
        """Test requesting password reset."""
        response = await async_client.post(
            "/api/v1/auth/password-reset-request",
            json={"email": test_user.email},
        )
        
        # Should return 200 even if email doesn't exist (security)
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_request_password_reset_nonexistent_email(self, async_client: AsyncClient):
        """Test requesting password reset for non-existent email (should still succeed for security)."""
        response = await async_client.post(
            "/api/v1/auth/password-reset-request",
            json={"email": "nonexistent@example.com"},
        )
        
        # Should return 200 to prevent email enumeration
        assert response.status_code == 200


# =============================================================================
# Password Change Tests
# =============================================================================

class TestPasswordChange:
    """Tests for password change functionality."""
    
    @pytest.mark.asyncio
    async def test_change_password_success(self, async_client: AsyncClient, auth_headers: dict):
        """Test successful password change."""
        response = await async_client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "TestPassword123!",
                "new_password": "NewSecurePassword456!",
            },
        )
        
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_change_password_wrong_current(self, async_client: AsyncClient, auth_headers: dict):
        """Test password change with wrong current password."""
        response = await async_client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewSecurePassword456!",
            },
        )
        
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_change_password_same_as_current(self, async_client: AsyncClient, auth_headers: dict):
        """Test password change to same password fails."""
        response = await async_client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "TestPassword123!",
                "new_password": "TestPassword123!",
            },
        )
        
        assert response.status_code == 400


# =============================================================================
# Security Function Unit Tests
# =============================================================================

class TestSecurityFunctions:
    """Unit tests for security helper functions."""
    
    def test_password_hash_and_verify(self):
        """Test password hashing and verification."""
        from app.core.security import get_password_hash, verify_password
        
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("WrongPassword", hashed)
    
    def test_create_access_token(self):
        """Test access token creation."""
        from app.core.security import create_access_token
        from jose import jwt
        from app.core.config import settings
        
        user_id = str(uuid4())
        token = create_access_token(subject=user_id)
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == user_id
        assert "exp" in payload
    
    def test_create_access_token_custom_expiry(self):
        """Test access token with custom expiry."""
        from app.core.security import create_access_token
        from jose import jwt
        from app.core.config import settings
        
        user_id = str(uuid4())
        expires_delta = timedelta(hours=2)
        token = create_access_token(subject=user_id, expires_delta=expires_delta)
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == user_id
