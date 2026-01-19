"""
Basic tests for SurgicalPrep API.
Run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient


def test_health_check():
    """Test the health endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test the root endpoint."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/")
    
    assert response.status_code == 200
    assert "name" in response.json()
    assert response.json()["name"] == "SurgicalPrep API"


def test_docs_available():
    """Test that API docs are accessible."""
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/docs")
    
    assert response.status_code == 200


# Add more tests as you build out features
# Example structure:

# class TestAuth:
#     def test_signup_success(self):
#         pass
#     
#     def test_signup_duplicate_email(self):
#         pass
#     
#     def test_login_success(self):
#         pass
#     
#     def test_login_wrong_password(self):
#         pass


# class TestInstruments:
#     def test_list_instruments(self):
#         pass
#     
#     def test_search_instruments(self):
#         pass
#     
#     def test_get_instrument_detail(self):
#         pass
