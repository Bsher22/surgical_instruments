"""
SQLAlchemy async ORM models for SurgicalPrep.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from app.db.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="surgical_tech")
    institution: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Subscription
    subscription_tier: Mapped[str] = mapped_column(String(20), default="free")
    subscription_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    preference_cards: Mapped[List["PreferenceCard"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    quiz_sessions: Mapped[List["QuizSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    instrument_progress: Mapped[List["UserInstrumentProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Instrument(Base):
    __tablename__ = "instruments"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    aliases: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    primary_uses: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    common_procedures: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    handling_notes: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Premium content flags
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Full-text search index (handled in SQL schema)
    __table_args__ = (
        Index("idx_instruments_name_search", "name"),
    )


class PreferenceCard(Base):
    __tablename__ = "preference_cards"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Card info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    surgeon_name: Mapped[Optional[str]] = mapped_column(String(100))
    procedure_name: Mapped[Optional[str]] = mapped_column(String(200))
    specialty: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    
    # Notes
    general_notes: Mapped[Optional[str]] = mapped_column(Text)
    setup_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Items (stored as JSON array)
    items: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    
    # Photos (array of URLs)
    photo_urls: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Flags
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="preference_cards")


class UserInstrumentProgress(Base):
    __tablename__ = "user_instrument_progress"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    instrument_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    
    # Spaced repetition (SM-2 algorithm)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Stats
    times_studied: Mapped[int] = mapped_column(Integer, default=0)
    times_correct: Mapped[int] = mapped_column(Integer, default=0)
    last_studied_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Bookmarked
    is_bookmarked: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="instrument_progress")
    
    __table_args__ = (
        Index("idx_user_instrument_progress_unique", "user_id", "instrument_id", unique=True),
    )


class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Session config
    quiz_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'flashcard', 'multiple_choice'
    category_filter: Mapped[Optional[str]] = mapped_column(String(100))
    question_count: Mapped[int] = mapped_column(Integer, default=10)
    
    # Results
    score: Mapped[Optional[int]] = mapped_column(Integer)
    total_questions: Mapped[Optional[int]] = mapped_column(Integer)
    time_spent_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Status
    status: Mapped[str] = mapped_column(String(20), default="in_progress")  # 'in_progress', 'completed', 'abandoned'
    
    # Questions and answers (JSON)
    questions: Mapped[Optional[dict]] = mapped_column(JSON)
    answers: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Timestamps
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="quiz_sessions")
