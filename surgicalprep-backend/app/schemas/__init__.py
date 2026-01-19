"""
Pydantic schemas for SurgicalPrep API.
"""
from app.schemas.user import (
    UserSignup,
    UserLogin,
    TokenResponse,
    TokenRefresh,
    UserResponse,
    UserUpdate,
    PasswordChange,
    SubscriptionStatus,
)
from app.schemas.instrument import (
    InstrumentCreate,
    InstrumentUpdate,
    InstrumentResponse,
    InstrumentListResponse,
    InstrumentSearchParams,
    PaginatedInstruments,
    CategoryResponse,
)
from app.schemas.card import (
    CardItem,
    PreferenceCardCreate,
    PreferenceCardUpdate,
    PreferenceCardResponse,
    PreferenceCardListItem,
    PaginatedCards,
    DuplicateCardRequest,
)
from app.schemas.quiz import (
    QuizConfig,
    QuizQuestion,
    QuizSessionStart,
    AnswerSubmission,
    AnswerResult,
    QuizSessionComplete,
    QuizSessionSummary,
    InstrumentProgress,
    StudyStats,
    FlashcardResult,
    BookmarkUpdate,
)

__all__ = [
    # User
    "UserSignup",
    "UserLogin", 
    "TokenResponse",
    "TokenRefresh",
    "UserResponse",
    "UserUpdate",
    "PasswordChange",
    "SubscriptionStatus",
    # Instrument
    "InstrumentCreate",
    "InstrumentUpdate",
    "InstrumentResponse",
    "InstrumentListResponse",
    "InstrumentSearchParams",
    "PaginatedInstruments",
    "CategoryResponse",
    # Card
    "CardItem",
    "PreferenceCardCreate",
    "PreferenceCardUpdate",
    "PreferenceCardResponse",
    "PreferenceCardListItem",
    "PaginatedCards",
    "DuplicateCardRequest",
    # Quiz
    "QuizConfig",
    "QuizQuestion",
    "QuizSessionStart",
    "AnswerSubmission",
    "AnswerResult",
    "QuizSessionComplete",
    "QuizSessionSummary",
    "InstrumentProgress",
    "StudyStats",
    "FlashcardResult",
    "BookmarkUpdate",
]
