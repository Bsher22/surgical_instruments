"""
Quiz & Study endpoints: sessions, flashcards, progress tracking.
"""
import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import User, Instrument, QuizSession, UserInstrumentProgress
from app.core.security import get_current_user_id
from app.core.config import settings
from app.schemas.quiz import (
    QuizConfig,
    QuizQuestion,
    QuizSessionStart,
    AnswerSubmission,
    AnswerResult,
    QuizSessionComplete,
    QuizSessionSummary,
    StudyStats,
    FlashcardResult,
    BookmarkUpdate,
)

router = APIRouter()


async def check_quiz_limit(db: AsyncSession, user_id: str) -> None:
    """Check if user has reached their daily quiz limit."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.subscription_tier == "premium":
        return
    
    # Count today's quizzes
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count(QuizSession.id))
        .where(QuizSession.user_id == user_id)
        .where(QuizSession.started_at >= today_start)
    )
    quiz_count = count_result.scalar() or 0
    
    if quiz_count >= settings.FREE_TIER_DAILY_QUIZZES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Daily quiz limit reached ({settings.FREE_TIER_DAILY_QUIZZES}). Upgrade to premium for unlimited quizzes.",
        )


async def generate_questions(
    db: AsyncSession,
    quiz_type: str,
    category: Optional[str],
    count: int,
) -> list[QuizQuestion]:
    """Generate quiz questions from instrument database."""
    # Get instruments
    stmt = select(Instrument)
    if category:
        stmt = stmt.where(Instrument.category == category)
    
    result = await db.execute(stmt)
    instruments = list(result.scalars().all())
    
    if len(instruments) < 4:
        raise HTTPException(
            status_code=400,
            detail="Not enough instruments in this category for a quiz",
        )
    
    # Shuffle and take sample
    random.shuffle(instruments)
    selected = instruments[:min(count, len(instruments))]
    
    questions = []
    for instrument in selected:
        question_id = str(uuid.uuid4())
        
        if quiz_type == "flashcard":
            # Flashcards don't need options
            questions.append(QuizQuestion(
                id=question_id,
                question_type="flashcard",
                instrument_id=instrument.id,
                image_url=instrument.image_url,
                question_text="What is this instrument?",
                correct_answer=instrument.name,
            ))
        else:
            # Multiple choice - image to name
            wrong_answers = [i.name for i in instruments if i.id != instrument.id]
            random.shuffle(wrong_answers)
            options = [instrument.name] + wrong_answers[:3]
            random.shuffle(options)
            
            questions.append(QuizQuestion(
                id=question_id,
                question_type="image_to_name",
                instrument_id=instrument.id,
                image_url=instrument.image_url,
                question_text="Identify this surgical instrument:",
                options=options,
                correct_answer=instrument.name,
            ))
    
    return questions


@router.post("/start", response_model=QuizSessionStart)
async def start_quiz(
    config: QuizConfig,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Start a new quiz session."""
    await check_quiz_limit(db, user_id)
    
    # Generate questions
    questions = await generate_questions(
        db, config.quiz_type, config.category_filter, config.question_count
    )
    
    # Create session
    session = QuizSession(
        user_id=user_id,
        quiz_type=config.quiz_type,
        category_filter=config.category_filter,
        question_count=len(questions),
        questions=[q.model_dump() for q in questions],
        answers=[],
    )
    db.add(session)
    await db.flush()
    
    return QuizSessionStart(
        session_id=session.id,
        questions=questions,
        total_questions=len(questions),
    )


@router.post("/{session_id}/answer", response_model=AnswerResult)
async def submit_answer(
    session_id: str,
    data: AnswerSubmission,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Submit an answer for a quiz question."""
    result = await db.execute(
        select(QuizSession)
        .where(QuizSession.id == session_id)
        .where(QuizSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Session is not active")
    
    # Find question
    questions = session.questions or []
    question = next((q for q in questions if q["id"] == data.question_id), None)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check answer
    is_correct = data.answer.lower().strip() == question["correct_answer"].lower().strip()
    
    # Record answer
    answers = session.answers or []
    answers.append({
        "question_id": data.question_id,
        "answer": data.answer,
        "is_correct": is_correct,
        "time_taken": data.time_taken_seconds,
    })
    session.answers = answers
    
    # Update instrument progress
    await update_progress(db, user_id, question["instrument_id"], is_correct)
    
    await db.flush()
    
    return AnswerResult(
        question_id=data.question_id,
        is_correct=is_correct,
        correct_answer=question["correct_answer"],
        explanation=None,
    )


async def update_progress(db: AsyncSession, user_id: str, instrument_id: str, is_correct: bool):
    """Update user's progress for an instrument using SM-2 algorithm."""
    result = await db.execute(
        select(UserInstrumentProgress)
        .where(UserInstrumentProgress.user_id == user_id)
        .where(UserInstrumentProgress.instrument_id == instrument_id)
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserInstrumentProgress(
            user_id=user_id,
            instrument_id=instrument_id,
        )
        db.add(progress)
    
    progress.times_studied += 1
    progress.last_studied_at = datetime.now(timezone.utc)
    
    if is_correct:
        progress.times_correct += 1
        progress.repetitions += 1
        
        # SM-2 algorithm
        if progress.repetitions == 1:
            progress.interval_days = 1
        elif progress.repetitions == 2:
            progress.interval_days = 6
        else:
            progress.interval_days = int(progress.interval_days * progress.ease_factor)
        
        progress.ease_factor = max(1.3, progress.ease_factor + 0.1)
    else:
        progress.repetitions = 0
        progress.interval_days = 1
        progress.ease_factor = max(1.3, progress.ease_factor - 0.2)
    
    progress.next_review_at = datetime.now(timezone.utc) + timedelta(days=progress.interval_days)


@router.post("/{session_id}/complete", response_model=QuizSessionComplete)
async def complete_quiz(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Complete a quiz session and get results."""
    result = await db.execute(
        select(QuizSession)
        .where(QuizSession.id == session_id)
        .where(QuizSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate results
    answers = session.answers or []
    correct_count = sum(1 for a in answers if a.get("is_correct"))
    total_time = sum(a.get("time_taken", 0) or 0 for a in answers)
    
    # Update session
    session.status = "completed"
    session.score = correct_count
    session.total_questions = len(answers)
    session.time_spent_seconds = total_time
    session.completed_at = datetime.now(timezone.utc)
    
    await db.flush()
    
    # Build results
    questions = {q["id"]: q for q in (session.questions or [])}
    results = [
        AnswerResult(
            question_id=a["question_id"],
            is_correct=a["is_correct"],
            correct_answer=questions.get(a["question_id"], {}).get("correct_answer", ""),
            explanation=None,
        )
        for a in answers
    ]
    
    return QuizSessionComplete(
        session_id=session_id,
        score=correct_count,
        total_questions=len(answers),
        percentage=round(correct_count / len(answers) * 100, 1) if answers else 0,
        time_spent_seconds=total_time,
        results=results,
    )


@router.get("/history", response_model=list[QuizSessionSummary])
async def get_quiz_history(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get user's quiz history."""
    result = await db.execute(
        select(QuizSession)
        .where(QuizSession.user_id == user_id)
        .order_by(QuizSession.started_at.desc())
        .limit(limit)
    )
    sessions = result.scalars().all()
    
    return [QuizSessionSummary.model_validate(s) for s in sessions]


@router.get("/stats", response_model=StudyStats)
async def get_study_stats(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get user's overall study statistics."""
    # Total instruments studied
    studied_result = await db.execute(
        select(func.count(UserInstrumentProgress.id))
        .where(UserInstrumentProgress.user_id == user_id)
        .where(UserInstrumentProgress.times_studied > 0)
    )
    total_studied = studied_result.scalar() or 0
    
    # Total quizzes completed
    quizzes_result = await db.execute(
        select(func.count(QuizSession.id))
        .where(QuizSession.user_id == user_id)
        .where(QuizSession.status == "completed")
    )
    total_quizzes = quizzes_result.scalar() or 0
    
    # Average score
    avg_result = await db.execute(
        select(func.avg(QuizSession.score * 100.0 / QuizSession.total_questions))
        .where(QuizSession.user_id == user_id)
        .where(QuizSession.status == "completed")
        .where(QuizSession.total_questions > 0)
    )
    avg_score = avg_result.scalar() or 0
    
    # Due for review
    now = datetime.now(timezone.utc)
    due_result = await db.execute(
        select(func.count(UserInstrumentProgress.id))
        .where(UserInstrumentProgress.user_id == user_id)
        .where(UserInstrumentProgress.next_review_at <= now)
    )
    due_count = due_result.scalar() or 0
    
    return StudyStats(
        total_instruments_studied=total_studied,
        total_quizzes_completed=total_quizzes,
        average_score=round(avg_score, 1),
        current_streak=0,  # TODO: Implement streak tracking
        due_for_review=due_count,
    )


@router.post("/flashcard-result")
async def record_flashcard_result(
    data: FlashcardResult,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Record a flashcard swipe result."""
    is_correct = data.result == "got_it"
    await update_progress(db, user_id, data.instrument_id, is_correct)
    await db.flush()
    return {"status": "recorded"}


@router.post("/bookmark")
async def update_bookmark(
    data: BookmarkUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Bookmark or unbookmark an instrument."""
    result = await db.execute(
        select(UserInstrumentProgress)
        .where(UserInstrumentProgress.user_id == user_id)
        .where(UserInstrumentProgress.instrument_id == data.instrument_id)
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserInstrumentProgress(
            user_id=user_id,
            instrument_id=data.instrument_id,
        )
        db.add(progress)
    
    progress.is_bookmarked = data.is_bookmarked
    await db.flush()
    
    return {"status": "updated", "is_bookmarked": data.is_bookmarked}


@router.get("/due-for-review")
async def get_due_for_review(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get instruments due for review."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(UserInstrumentProgress, Instrument)
        .join(Instrument, UserInstrumentProgress.instrument_id == Instrument.id)
        .where(UserInstrumentProgress.user_id == user_id)
        .where(UserInstrumentProgress.next_review_at <= now)
        .order_by(UserInstrumentProgress.next_review_at)
        .limit(limit)
    )
    rows = result.all()
    
    return [
        {
            "instrument_id": row[1].id,
            "name": row[1].name,
            "category": row[1].category,
            "thumbnail_url": row[1].thumbnail_url,
            "times_studied": row[0].times_studied,
            "accuracy": round(row[0].times_correct / row[0].times_studied * 100, 1) if row[0].times_studied > 0 else 0,
        }
        for row in rows
    ]
