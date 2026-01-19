"""
Instruments endpoints: list, search, detail, categories.
"""
import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Instrument
from app.core.security import get_current_user_payload
from app.schemas.instrument import (
    InstrumentResponse,
    InstrumentListResponse,
    PaginatedInstruments,
    CategoryResponse,
)

router = APIRouter()

# Path to seed data
SEED_DATA_PATH = Path(__file__).parent.parent.parent.parent / "scripts" / "data" / "instruments.json"


@router.get("", response_model=PaginatedInstruments)
async def list_instruments(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List instruments with optional search and filtering."""
    # Build base query
    stmt = select(Instrument)
    count_stmt = select(func.count(Instrument.id))
    
    # Apply search filter
    if query:
        search_filter = or_(
            Instrument.name.ilike(f"%{query}%"),
            Instrument.description.ilike(f"%{query}%"),
        )
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)
    
    # Apply category filter
    if category:
        stmt = stmt.where(Instrument.category == category)
        count_stmt = count_stmt.where(Instrument.category == category)
    
    # Get total count
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    stmt = stmt.order_by(Instrument.name).offset(offset).limit(page_size)
    
    result = await db.execute(stmt)
    instruments = result.scalars().all()
    
    return PaginatedInstruments(
        items=[InstrumentListResponse.model_validate(i) for i in instruments],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Get all instrument categories with counts."""
    stmt = (
        select(Instrument.category, func.count(Instrument.id).label("count"))
        .group_by(Instrument.category)
        .order_by(Instrument.category)
    )
    result = await db.execute(stmt)
    categories = result.all()
    
    return [CategoryResponse(name=c[0], count=c[1]) for c in categories]


@router.get("/search")
async def search_instruments(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Quick search for autocomplete suggestions."""
    stmt = (
        select(Instrument.id, Instrument.name, Instrument.category)
        .where(Instrument.name.ilike(f"%{q}%"))
        .order_by(Instrument.name)
        .limit(limit)
    )
    result = await db.execute(stmt)
    instruments = result.all()
    
    return [
        {"id": i[0], "name": i[1], "category": i[2]}
        for i in instruments
    ]


@router.get("/{instrument_id}", response_model=InstrumentResponse)
async def get_instrument(
    instrument_id: str,
    db: AsyncSession = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload),
):
    """Get instrument details by ID."""
    result = await db.execute(
        select(Instrument).where(Instrument.id == instrument_id)
    )
    instrument = result.scalar_one_or_none()
    
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    
    # Check premium access
    if instrument.is_premium and user_payload.get("tier") != "premium":
        # Return limited data for free users
        return InstrumentResponse(
            id=instrument.id,
            name=instrument.name,
            aliases=instrument.aliases,
            category=instrument.category,
            description="Upgrade to premium to view full details.",
            primary_uses=None,
            common_procedures=None,
            handling_notes=None,
            image_url=instrument.thumbnail_url,  # Show only thumbnail
            thumbnail_url=instrument.thumbnail_url,
            is_premium=True,
            created_at=instrument.created_at,
            updated_at=instrument.updated_at,
        )
    
    return instrument


@router.post("/seed", tags=["Admin"])
async def seed_instruments(
    db: AsyncSession = Depends(get_db),
):
    """Seed the database with sample instruments. Only works if database is empty."""
    # Check if instruments already exist
    result = await db.execute(select(func.count(Instrument.id)))
    count = result.scalar() or 0

    if count > 0:
        return {"message": f"Database already has {count} instruments. Skipping seed.", "seeded": 0}

    # Load seed data
    if not SEED_DATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Seed data file not found")

    with open(SEED_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    instruments_data = data.get("instruments", [])

    # Insert instruments
    seeded = 0
    for item in instruments_data:
        instrument = Instrument(
            name=item["name"],
            aliases=item.get("aliases", []),
            category=item["category"],
            description=item.get("description", ""),
            primary_uses=item.get("primary_uses", []),
            common_procedures=item.get("common_procedures", []),
            handling_notes=item.get("handling_notes"),
            image_url=item.get("image_url"),
            thumbnail_url=item.get("thumbnail_url"),
            is_premium=item.get("is_premium", False),
        )
        db.add(instrument)
        seeded += 1

    await db.commit()

    return {"message": f"Successfully seeded {seeded} instruments", "seeded": seeded}
