"""
Preference Cards endpoints: CRUD, templates, duplication.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import User, PreferenceCard
from app.core.security import get_current_user_id
from app.core.config import settings
from app.schemas.card import (
    PreferenceCardCreate,
    PreferenceCardUpdate,
    PreferenceCardResponse,
    PreferenceCardListItem,
    PaginatedCards,
    DuplicateCardRequest,
)

router = APIRouter()


async def check_card_limit(db: AsyncSession, user_id: str) -> None:
    """Check if user has reached their card limit."""
    # Get user tier
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.subscription_tier == "premium":
        return  # No limit for premium
    
    # Count existing cards
    count_result = await db.execute(
        select(func.count(PreferenceCard.id))
        .where(PreferenceCard.user_id == user_id)
        .where(PreferenceCard.is_template == False)
    )
    card_count = count_result.scalar() or 0
    
    if card_count >= settings.FREE_TIER_CARDS_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Free tier limit reached ({settings.FREE_TIER_CARDS_LIMIT} cards). Upgrade to premium for unlimited cards.",
        )


@router.get("", response_model=PaginatedCards)
async def list_cards(
    query: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List user's preference cards."""
    stmt = select(PreferenceCard).where(PreferenceCard.user_id == user_id)
    count_stmt = select(func.count(PreferenceCard.id)).where(PreferenceCard.user_id == user_id)
    
    # Apply search
    if query:
        search_filter = or_(
            PreferenceCard.title.ilike(f"%{query}%"),
            PreferenceCard.surgeon_name.ilike(f"%{query}%"),
            PreferenceCard.procedure_name.ilike(f"%{query}%"),
        )
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)
    
    # Apply specialty filter
    if specialty:
        stmt = stmt.where(PreferenceCard.specialty == specialty)
        count_stmt = count_stmt.where(PreferenceCard.specialty == specialty)
    
    # Get total
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Paginate
    offset = (page - 1) * page_size
    stmt = stmt.order_by(PreferenceCard.updated_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(stmt)
    cards = result.scalars().all()
    
    # Convert to list items with item count
    items = []
    for card in cards:
        items.append(PreferenceCardListItem(
            id=card.id,
            title=card.title,
            surgeon_name=card.surgeon_name,
            procedure_name=card.procedure_name,
            specialty=card.specialty,
            item_count=len(card.items) if card.items else 0,
            updated_at=card.updated_at,
        ))
    
    return PaginatedCards(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/templates", response_model=list[PreferenceCardListItem])
async def list_templates(db: AsyncSession = Depends(get_db)):
    """List public template cards."""
    stmt = (
        select(PreferenceCard)
        .where(PreferenceCard.is_template == True)
        .where(PreferenceCard.is_public == True)
        .order_by(PreferenceCard.title)
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()
    
    return [
        PreferenceCardListItem(
            id=c.id,
            title=c.title,
            surgeon_name=c.surgeon_name,
            procedure_name=c.procedure_name,
            specialty=c.specialty,
            item_count=len(c.items) if c.items else 0,
            updated_at=c.updated_at,
        )
        for c in cards
    ]


@router.get("/{card_id}", response_model=PreferenceCardResponse)
async def get_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get a preference card by ID."""
    result = await db.execute(
        select(PreferenceCard).where(PreferenceCard.id == card_id)
    )
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check access (owner or public template)
    if card.user_id != user_id and not (card.is_template and card.is_public):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return card


@router.post("", response_model=PreferenceCardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    data: PreferenceCardCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Create a new preference card."""
    await check_card_limit(db, user_id)
    
    card = PreferenceCard(
        user_id=user_id,
        title=data.title,
        surgeon_name=data.surgeon_name,
        procedure_name=data.procedure_name,
        specialty=data.specialty,
        general_notes=data.general_notes,
        setup_notes=data.setup_notes,
        items=[item.model_dump() for item in data.items],
        photo_urls=data.photo_urls,
    )
    db.add(card)
    await db.flush()
    await db.refresh(card)
    
    return card


@router.patch("/{card_id}", response_model=PreferenceCardResponse)
async def update_card(
    card_id: str,
    data: PreferenceCardUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Update a preference card."""
    result = await db.execute(
        select(PreferenceCard)
        .where(PreferenceCard.id == card_id)
        .where(PreferenceCard.user_id == user_id)
    )
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    if "items" in update_data and update_data["items"] is not None:
        update_data["items"] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in update_data["items"]]
    
    for field, value in update_data.items():
        setattr(card, field, value)
    
    await db.flush()
    await db.refresh(card)
    
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Delete a preference card."""
    result = await db.execute(
        select(PreferenceCard)
        .where(PreferenceCard.id == card_id)
        .where(PreferenceCard.user_id == user_id)
    )
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    await db.delete(card)
    await db.flush()


@router.post("/{card_id}/duplicate", response_model=PreferenceCardResponse)
async def duplicate_card(
    card_id: str,
    data: DuplicateCardRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Duplicate a preference card."""
    await check_card_limit(db, user_id)
    
    # Get original card
    result = await db.execute(
        select(PreferenceCard).where(PreferenceCard.id == card_id)
    )
    original = result.scalar_one_or_none()
    
    if not original:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Check access
    if original.user_id != user_id and not (original.is_template and original.is_public):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create copy
    new_title = data.new_title if data.new_title else f"{original.title} (Copy)"
    
    new_card = PreferenceCard(
        user_id=user_id,
        title=new_title,
        surgeon_name=original.surgeon_name,
        procedure_name=original.procedure_name,
        specialty=original.specialty,
        general_notes=original.general_notes,
        setup_notes=original.setup_notes,
        items=original.items,
        photo_urls=original.photo_urls,
    )
    db.add(new_card)
    await db.flush()
    await db.refresh(new_card)
    
    return new_card
