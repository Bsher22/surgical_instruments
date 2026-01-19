"""
Tests for quiz and study endpoints.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from httpx import AsyncClient

from app.db.models import QuizSession, Instrument, User


# =============================================================================
# Start Quiz Session Tests
# =============================================================================

class TestStartQuizSession:
    """Tests for starting quiz sessions."""
    
    @pytest.mark.asyncio
    async def test_start_flashcard_session(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test starting a flashcard study session."""
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "flashcard",
                "question_count": 10,
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert "questions" in data or "cards" in data
        assert data["quiz_type"] == "flashcard"
    
    @pytest.mark.asyncio
    async def test_start_multiple_choice_session(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test starting a multiple choice quiz session."""
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 10,
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert "questions" in data
        # Each question should have options
        for question in data["questions"]:
            assert "options" in question
            assert len(question["options"]) >= 4
    
    @pytest.mark.asyncio
    async def test_start_session_with_category(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test starting quiz filtered by category."""
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 5,
                "category": "cutting",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data.get("category") == "cutting"
    
    @pytest.mark.asyncio
    async def test_start_review_due_session(
        self, async_client: AsyncClient, auth_headers: dict, user_progress
    ):
        """Test starting a review session for due instruments."""
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "flashcard",
                "review_due_only": True,
            },
        )
        
        # May return 201 with items or 200 with empty if none due
        assert response.status_code in [200, 201]
    
    @pytest.mark.asyncio
    async def test_start_session_free_tier_limit(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test free tier daily quiz limit."""
        # Start 3 quizzes (free tier limit)
        for i in range(3):
            response = await async_client.post(
                "/api/v1/quiz/start",
                headers=auth_headers,
                json={
                    "quiz_type": "multiple_choice",
                    "question_count": 5,
                },
            )
            # Complete each quiz
            if response.status_code == 201:
                session_id = response.json()["session_id"]
                await async_client.post(
                    f"/api/v1/quiz/{session_id}/complete",
                    headers=auth_headers,
                )
        
        # Fourth quiz should fail
        response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 5,
            },
        )
        
        assert response.status_code in [402, 403, 429]
    
    @pytest.mark.asyncio
    async def test_start_session_premium_no_limit(
        self, async_client: AsyncClient, premium_auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test premium user has no daily quiz limit."""
        for i in range(5):
            response = await async_client.post(
                "/api/v1/quiz/start",
                headers=premium_auth_headers,
                json={
                    "quiz_type": "flashcard",
                    "question_count": 5,
                },
            )
            assert response.status_code == 201


# =============================================================================
# Submit Answer Tests
# =============================================================================

class TestSubmitAnswer:
    """Tests for submitting quiz answers."""
    
    @pytest.mark.asyncio
    async def test_submit_correct_answer(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test submitting a correct answer."""
        # Start a session
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 5,
            },
        )
        
        if start_response.status_code == 201:
            data = start_response.json()
            session_id = data["session_id"]
            question = data["questions"][0]
            
            # Submit the correct answer
            response = await async_client.post(
                f"/api/v1/quiz/{session_id}/answer",
                headers=auth_headers,
                json={
                    "question_id": question["id"],
                    "answer": question["correct_answer"],
                },
            )
            
            assert response.status_code == 200
            result = response.json()
            assert result["is_correct"] is True
    
    @pytest.mark.asyncio
    async def test_submit_incorrect_answer(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test submitting an incorrect answer."""
        # Start a session
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 5,
            },
        )
        
        if start_response.status_code == 201:
            data = start_response.json()
            session_id = data["session_id"]
            question = data["questions"][0]
            
            # Find an incorrect answer
            incorrect_answer = next(
                opt for opt in question["options"]
                if opt != question["correct_answer"]
            )
            
            # Submit incorrect answer
            response = await async_client.post(
                f"/api/v1/quiz/{session_id}/answer",
                headers=auth_headers,
                json={
                    "question_id": question["id"],
                    "answer": incorrect_answer,
                },
            )
            
            assert response.status_code == 200
            result = response.json()
            assert result["is_correct"] is False
            assert "correct_answer" in result
    
    @pytest.mark.asyncio
    async def test_submit_flashcard_response(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test submitting flashcard response (knew it / didn't know)."""
        # Start a flashcard session
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "flashcard",
                "question_count": 5,
            },
        )
        
        if start_response.status_code == 201:
            data = start_response.json()
            session_id = data["session_id"]
            cards = data.get("cards") or data.get("questions")
            
            if cards:
                card = cards[0]
                
                # Submit "knew it" response
                response = await async_client.post(
                    f"/api/v1/quiz/{session_id}/flashcard-response",
                    headers=auth_headers,
                    json={
                        "card_id": card["id"],
                        "knew_it": True,
                    },
                )
                
                assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_submit_answer_invalid_session(self, async_client: AsyncClient, auth_headers: dict):
        """Test submitting answer to non-existent session fails."""
        fake_session_id = uuid4()
        
        response = await async_client.post(
            f"/api/v1/quiz/{fake_session_id}/answer",
            headers=auth_headers,
            json={
                "question_id": str(uuid4()),
                "answer": "test",
            },
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_submit_answer_other_users_session(
        self, async_client: AsyncClient, auth_headers: dict, premium_auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test submitting answer to another user's session fails."""
        # Start session as test user
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 5,
            },
        )
        
        if start_response.status_code == 201:
            session_id = start_response.json()["session_id"]
            
            # Try to submit as premium user
            response = await async_client.post(
                f"/api/v1/quiz/{session_id}/answer",
                headers=premium_auth_headers,
                json={
                    "question_id": str(uuid4()),
                    "answer": "test",
                },
            )
            
            assert response.status_code in [403, 404]


# =============================================================================
# Complete Quiz Session Tests
# =============================================================================

class TestCompleteQuizSession:
    """Tests for completing quiz sessions."""
    
    @pytest.mark.asyncio
    async def test_complete_session_success(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test completing a quiz session."""
        # Start a session
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 3,
            },
        )
        
        if start_response.status_code == 201:
            session_id = start_response.json()["session_id"]
            
            # Complete the session
            response = await async_client.post(
                f"/api/v1/quiz/{session_id}/complete",
                headers=auth_headers,
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "score" in data or "correct_answers" in data
            assert "total_questions" in data
    
    @pytest.mark.asyncio
    async def test_complete_session_with_results(
        self, async_client: AsyncClient, auth_headers: dict, sample_instruments: list[Instrument]
    ):
        """Test session results include detailed breakdown."""
        # Start and complete a session with answers
        start_response = await async_client.post(
            "/api/v1/quiz/start",
            headers=auth_headers,
            json={
                "quiz_type": "multiple_choice",
                "question_count": 2,
            },
        )
        
        if start_response.status_code == 201:
            data = start_response.json()
            session_id = data["session_id"]
            
            # Answer all questions
            for question in data["questions"]:
                await async_client.post(
                    f"/api/v1/quiz/{session_id}/answer",
                    headers=auth_headers,
                    json={
                        "question_id": question["id"],
                        "answer": question["options"][0],  # Just pick first option
                    },
                )
            
            # Complete
            response = await async_client.post(
                f"/api/v1/quiz/{session_id}/complete",
                headers=auth_headers,
            )
            
            assert response.status_code == 200
            result = response.json()
            assert "score" in result or "percentage" in result
    
    @pytest.mark.asyncio
    async def test_cannot_complete_already_completed(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test completing an already completed session fails."""
        response = await async_client.post(
            f"/api/v1/quiz/{completed_quiz_session.id}/complete",
            headers=auth_headers,
        )
        
        assert response.status_code in [400, 409]


# =============================================================================
# Quiz History Tests
# =============================================================================

class TestQuizHistory:
    """Tests for quiz history endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_quiz_history(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test getting quiz history."""
        response = await async_client.get(
            "/api/v1/quiz/history",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    @pytest.mark.asyncio
    async def test_get_quiz_history_filter_by_type(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test filtering quiz history by type."""
        response = await async_client.get(
            "/api/v1/quiz/history",
            headers=auth_headers,
            params={"quiz_type": "flashcard"},
        )
        
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["quiz_type"] == "flashcard"
    
    @pytest.mark.asyncio
    async def test_get_quiz_session_detail(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test getting details of a specific quiz session."""
        response = await async_client.get(
            f"/api/v1/quiz/{completed_quiz_session.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(completed_quiz_session.id)
        assert data["completed"] is True


# =============================================================================
# Quiz Statistics Tests
# =============================================================================

class TestQuizStatistics:
    """Tests for quiz statistics endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_overall_stats(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test getting overall quiz statistics."""
        response = await async_client.get(
            "/api/v1/quiz/stats",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_quizzes" in data or "quizzes_completed" in data
        assert "average_score" in data
        assert "total_questions_answered" in data or "instruments_studied" in data
    
    @pytest.mark.asyncio
    async def test_get_category_breakdown(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test getting stats breakdown by category."""
        response = await async_client.get(
            "/api/v1/quiz/stats/categories",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Should be a list or dict of category stats
        assert isinstance(data, (list, dict))
    
    @pytest.mark.asyncio
    async def test_get_study_streak(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting study streak information."""
        response = await async_client.get(
            "/api/v1/quiz/stats/streak",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "current_streak" in data or "streak" in data
        assert "longest_streak" in data or "best_streak" in data


# =============================================================================
# Review Mistakes Tests
# =============================================================================

class TestReviewMistakes:
    """Tests for reviewing quiz mistakes."""
    
    @pytest.mark.asyncio
    async def test_get_session_mistakes(
        self, async_client: AsyncClient, auth_headers: dict, completed_quiz_session: QuizSession
    ):
        """Test getting mistakes from a completed session."""
        response = await async_client.get(
            f"/api/v1/quiz/{completed_quiz_session.id}/mistakes",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_all_recent_mistakes(self, async_client: AsyncClient, auth_headers: dict):
        """Test getting all recent mistakes across sessions."""
        response = await async_client.get(
            "/api/v1/quiz/mistakes",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data


# =============================================================================
# Due for Review Tests
# =============================================================================

class TestDueForReview:
    """Tests for instruments due for review."""
    
    @pytest.mark.asyncio
    async def test_get_due_for_review(
        self, async_client: AsyncClient, auth_headers: dict, user_progress
    ):
        """Test getting instruments due for review."""
        response = await async_client.get(
            "/api/v1/quiz/due-for-review",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data or "instruments" in data
        assert "count" in data or "total" in data
    
    @pytest.mark.asyncio
    async def test_due_for_review_count(
        self, async_client: AsyncClient, auth_headers: dict, user_progress
    ):
        """Test getting count of items due for review."""
        response = await async_client.get(
            "/api/v1/quiz/due-for-review/count",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
