"""
Pydantic schemas for quiz and study system.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# Quiz session
class QuizConfig(BaseModel):
    quiz_type: str = Field(..., pattern="^(flashcard|multiple_choice)$")
    category_filter: Optional[str] = None
    question_count: int = Field(default=10, ge=5, le=50)


class QuizQuestion(BaseModel):
    id: str
    question_type: str  # image_to_name, name_to_use, image_to_category
    instrument_id: str
    image_url: Optional[str] = None
    question_text: str
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: str


class QuizSessionStart(BaseModel):
    session_id: str
    questions: List[QuizQuestion]
    total_questions: int


class AnswerSubmission(BaseModel):
    question_id: str
    answer: str
    time_taken_seconds: Optional[int] = None


class AnswerResult(BaseModel):
    question_id: str
    is_correct: bool
    correct_answer: str
    explanation: Optional[str] = None


class QuizSessionComplete(BaseModel):
    session_id: str
    score: int
    total_questions: int
    percentage: float
    time_spent_seconds: int
    results: List[AnswerResult]


class QuizSessionSummary(BaseModel):
    id: str
    quiz_type: str
    category_filter: Optional[str] = None
    score: Optional[int] = None
    total_questions: Optional[int] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Study progress
class InstrumentProgress(BaseModel):
    instrument_id: str
    instrument_name: str
    times_studied: int
    times_correct: int
    accuracy: float
    next_review_at: Optional[datetime] = None
    is_bookmarked: bool


class StudyStats(BaseModel):
    total_instruments_studied: int
    total_quizzes_completed: int
    average_score: float
    current_streak: int
    due_for_review: int


class FlashcardResult(BaseModel):
    instrument_id: str
    result: str = Field(..., pattern="^(got_it|study_more)$")


class BookmarkUpdate(BaseModel):
    instrument_id: str
    is_bookmarked: bool
