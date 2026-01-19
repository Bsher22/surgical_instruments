"""
Pytest configuration and shared fixtures for backend tests.
"""
import asyncio
from datetime import datetime, timedelta
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.db.models import User, Instrument, PreferenceCard, CardItem, QuizSession, UserInstrumentProgress
from app.core.security import get_password_hash, create_access_token
from app.core.config import settings


# Test database URL - use SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session_maker = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def async_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing."""
    
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()


# =============================================================================
# User Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def test_user(test_db: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="testuser@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        full_name="Test User",
        role="surgical_tech",
        institution="Test Hospital",
        is_premium=False,
        is_active=True,
        created_at=datetime.utcnow(),
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest_asyncio.fixture
async def premium_user(test_db: AsyncSession) -> User:
    """Create a premium test user."""
    user = User(
        id=uuid4(),
        email="premium@example.com",
        hashed_password=get_password_hash("PremiumPassword123!"),
        full_name="Premium User",
        role="surgical_tech",
        institution="Premium Hospital",
        is_premium=True,
        premium_until=datetime.utcnow() + timedelta(days=30),
        is_active=True,
        created_at=datetime.utcnow(),
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest_asyncio.fixture
async def inactive_user(test_db: AsyncSession) -> User:
    """Create an inactive test user."""
    user = User(
        id=uuid4(),
        email="inactive@example.com",
        hashed_password=get_password_hash("InactivePassword123!"),
        full_name="Inactive User",
        role="student",
        is_premium=False,
        is_active=False,
        created_at=datetime.utcnow(),
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for the test user."""
    token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def premium_auth_headers(premium_user: User) -> dict:
    """Create authentication headers for the premium user."""
    token = create_access_token(subject=str(premium_user.id))
    return {"Authorization": f"Bearer {token}"}


# =============================================================================
# Instrument Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def sample_instruments(test_db: AsyncSession) -> list[Instrument]:
    """Create sample instruments for testing."""
    instruments = [
        Instrument(
            id=uuid4(),
            name="Mayo Scissors",
            aliases=["Mayo Dissecting Scissors"],
            category="cutting",
            description="Heavy scissors used for cutting fascia and sutures.",
            primary_uses=["Cutting fascia", "Cutting sutures", "Dissection"],
            common_procedures=["General surgery", "Abdominal surgery"],
            handling_notes="Handle with care, keep blades aligned.",
            image_url="https://example.com/mayo-scissors.jpg",
            is_premium=False,
            created_at=datetime.utcnow(),
        ),
        Instrument(
            id=uuid4(),
            name="Kelly Forceps",
            aliases=["Kelly Clamp", "Kelly Hemostat"],
            category="clamping",
            description="Curved or straight hemostatic forceps for clamping blood vessels.",
            primary_uses=["Clamping blood vessels", "Grasping tissue"],
            common_procedures=["General surgery", "Vascular surgery"],
            handling_notes="Check ratchet mechanism regularly.",
            image_url="https://example.com/kelly-forceps.jpg",
            is_premium=False,
            created_at=datetime.utcnow(),
        ),
        Instrument(
            id=uuid4(),
            name="Debakey Forceps",
            aliases=["DeBakey Tissue Forceps"],
            category="grasping",
            description="Atraumatic tissue forceps with fine serrations.",
            primary_uses=["Grasping delicate tissue", "Vascular work"],
            common_procedures=["Cardiac surgery", "Vascular surgery"],
            handling_notes="Premium instrument - handle with extra care.",
            image_url="https://example.com/debakey-forceps.jpg",
            is_premium=True,  # Premium content
            created_at=datetime.utcnow(),
        ),
        Instrument(
            id=uuid4(),
            name="Metzenbaum Scissors",
            aliases=["Metz Scissors", "Metz"],
            category="cutting",
            description="Delicate scissors for cutting fine tissue.",
            primary_uses=["Dissecting tissue", "Cutting delicate structures"],
            common_procedures=["Plastic surgery", "General surgery"],
            handling_notes="Do not use on sutures or heavy tissue.",
            image_url="https://example.com/metzenbaum-scissors.jpg",
            is_premium=False,
            created_at=datetime.utcnow(),
        ),
        Instrument(
            id=uuid4(),
            name="Army-Navy Retractor",
            aliases=["US Army Retractor"],
            category="retraction",
            description="Double-ended retractor for superficial wound retraction.",
            primary_uses=["Retracting skin", "Superficial exposure"],
            common_procedures=["Minor surgery", "Wound exploration"],
            handling_notes="Apply gentle pressure to avoid tissue damage.",
            image_url="https://example.com/army-navy-retractor.jpg",
            is_premium=False,
            created_at=datetime.utcnow(),
        ),
    ]
    
    for instrument in instruments:
        test_db.add(instrument)
    
    await test_db.commit()
    
    for instrument in instruments:
        await test_db.refresh(instrument)
    
    return instruments


@pytest_asyncio.fixture
async def single_instrument(test_db: AsyncSession) -> Instrument:
    """Create a single instrument for testing."""
    instrument = Instrument(
        id=uuid4(),
        name="Test Scalpel",
        aliases=["Surgical Knife"],
        category="cutting",
        description="A test instrument for unit testing.",
        primary_uses=["Making incisions"],
        common_procedures=["All surgeries"],
        handling_notes="Test notes.",
        image_url="https://example.com/test-scalpel.jpg",
        is_premium=False,
        created_at=datetime.utcnow(),
    )
    test_db.add(instrument)
    await test_db.commit()
    await test_db.refresh(instrument)
    return instrument


# =============================================================================
# Preference Card Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def sample_card(test_db: AsyncSession, test_user: User, sample_instruments: list[Instrument]) -> PreferenceCard:
    """Create a sample preference card with items."""
    card = PreferenceCard(
        id=uuid4(),
        user_id=test_user.id,
        title="Laparoscopic Cholecystectomy",
        surgeon_name="Dr. Smith",
        procedure_name="Lap Chole",
        specialty="general",
        general_notes="Standard setup for lap chole.",
        setup_notes="Prepare laparoscopic tower first.",
        is_template=False,
        is_public=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    test_db.add(card)
    await test_db.flush()
    
    # Add items to the card
    items = [
        CardItem(
            id=uuid4(),
            card_id=card.id,
            instrument_id=sample_instruments[0].id,
            custom_name=None,
            quantity=2,
            size="Medium",
            notes="Curved preferred",
            category="instruments",
            sort_order=0,
        ),
        CardItem(
            id=uuid4(),
            card_id=card.id,
            instrument_id=sample_instruments[1].id,
            custom_name=None,
            quantity=4,
            size="Large",
            notes=None,
            category="instruments",
            sort_order=1,
        ),
        CardItem(
            id=uuid4(),
            card_id=card.id,
            instrument_id=None,
            custom_name="10-blade scalpel",
            quantity=2,
            size=None,
            notes="Have backup available",
            category="supplies",
            sort_order=2,
        ),
    ]
    
    for item in items:
        test_db.add(item)
    
    await test_db.commit()
    await test_db.refresh(card)
    return card


@pytest_asyncio.fixture
async def template_card(test_db: AsyncSession, sample_instruments: list[Instrument]) -> PreferenceCard:
    """Create a template preference card."""
    card = PreferenceCard(
        id=uuid4(),
        user_id=None,  # Templates have no user
        title="General Surgery Template",
        surgeon_name=None,
        procedure_name="Basic Setup",
        specialty="general",
        general_notes="Standard template for general surgery.",
        setup_notes=None,
        is_template=True,
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    test_db.add(card)
    await test_db.commit()
    await test_db.refresh(card)
    return card


@pytest_asyncio.fixture
async def user_cards(test_db: AsyncSession, test_user: User) -> list[PreferenceCard]:
    """Create multiple preference cards for a user (for limit testing)."""
    cards = []
    for i in range(5):
        card = PreferenceCard(
            id=uuid4(),
            user_id=test_user.id,
            title=f"Test Card {i + 1}",
            surgeon_name=f"Dr. Test {i + 1}",
            procedure_name=f"Procedure {i + 1}",
            specialty="general",
            is_template=False,
            is_public=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        test_db.add(card)
        cards.append(card)
    
    await test_db.commit()
    for card in cards:
        await test_db.refresh(card)
    return cards


# =============================================================================
# Quiz Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def quiz_session(test_db: AsyncSession, test_user: User) -> QuizSession:
    """Create a quiz session."""
    session = QuizSession(
        id=uuid4(),
        user_id=test_user.id,
        quiz_type="multiple_choice",
        category=None,
        total_questions=10,
        correct_answers=0,
        completed=False,
        started_at=datetime.utcnow(),
        completed_at=None,
    )
    test_db.add(session)
    await test_db.commit()
    await test_db.refresh(session)
    return session


@pytest_asyncio.fixture
async def completed_quiz_session(test_db: AsyncSession, test_user: User) -> QuizSession:
    """Create a completed quiz session."""
    session = QuizSession(
        id=uuid4(),
        user_id=test_user.id,
        quiz_type="flashcard",
        category="cutting",
        total_questions=10,
        correct_answers=8,
        completed=True,
        started_at=datetime.utcnow() - timedelta(minutes=10),
        completed_at=datetime.utcnow(),
    )
    test_db.add(session)
    await test_db.commit()
    await test_db.refresh(session)
    return session


# =============================================================================
# Study Progress Fixtures
# =============================================================================

@pytest_asyncio.fixture
async def user_progress(test_db: AsyncSession, test_user: User, sample_instruments: list[Instrument]) -> list[UserInstrumentProgress]:
    """Create study progress entries for a user."""
    progress_entries = []
    
    for i, instrument in enumerate(sample_instruments[:3]):
        progress = UserInstrumentProgress(
            id=uuid4(),
            user_id=test_user.id,
            instrument_id=instrument.id,
            times_studied=i + 1,
            times_correct=i,
            last_studied=datetime.utcnow() - timedelta(days=i),
            next_review=datetime.utcnow() + timedelta(days=i),
            ease_factor=2.5,
            interval=i + 1,
            is_bookmarked=i == 0,  # First instrument is bookmarked
        )
        test_db.add(progress)
        progress_entries.append(progress)
    
    await test_db.commit()
    for progress in progress_entries:
        await test_db.refresh(progress)
    
    return progress_entries


# =============================================================================
# Helper Functions
# =============================================================================

def create_test_token(user_id: str, expired: bool = False) -> str:
    """Create a test JWT token."""
    if expired:
        # Create an expired token
        expires_delta = timedelta(minutes=-10)
    else:
        expires_delta = timedelta(minutes=30)
    
    return create_access_token(subject=user_id, expires_delta=expires_delta)


# =============================================================================
# Pytest Configuration
# =============================================================================

def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line("markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')")
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "unit: marks tests as unit tests")
