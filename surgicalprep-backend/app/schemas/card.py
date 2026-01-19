"""
Pydantic schemas for preference card requests and responses.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CardItem(BaseModel):
    """Single item on a preference card."""
    id: str  # Client-generated UUID
    name: str
    category: str = "instruments"  # instruments, supplies, sutures, implants
    quantity: int = 1
    size: Optional[str] = None
    notes: Optional[str] = None
    instrument_id: Optional[str] = None  # Link to instruments table
    is_custom: bool = False
    sort_order: int = 0


class PreferenceCardBase(BaseModel):
    title: str = Field(..., max_length=200)
    surgeon_name: Optional[str] = Field(default=None, max_length=100)
    procedure_name: Optional[str] = Field(default=None, max_length=200)
    specialty: Optional[str] = Field(default=None, max_length=100)
    general_notes: Optional[str] = None
    setup_notes: Optional[str] = None


class PreferenceCardCreate(PreferenceCardBase):
    items: List[CardItem] = Field(default_factory=list)
    photo_urls: Optional[List[str]] = None


class PreferenceCardUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    surgeon_name: Optional[str] = Field(default=None, max_length=100)
    procedure_name: Optional[str] = Field(default=None, max_length=200)
    specialty: Optional[str] = Field(default=None, max_length=100)
    general_notes: Optional[str] = None
    setup_notes: Optional[str] = None
    items: Optional[List[CardItem]] = None
    photo_urls: Optional[List[str]] = None


class PreferenceCardResponse(PreferenceCardBase):
    id: str
    user_id: str
    items: List[CardItem]
    photo_urls: Optional[List[str]] = None
    is_template: bool
    is_public: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PreferenceCardListItem(BaseModel):
    id: str
    title: str
    surgeon_name: Optional[str] = None
    procedure_name: Optional[str] = None
    specialty: Optional[str] = None
    item_count: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaginatedCards(BaseModel):
    items: List[PreferenceCardListItem]
    total: int
    page: int
    page_size: int


# Duplicate request
class DuplicateCardRequest(BaseModel):
    new_title: Optional[str] = None  # If not provided, appends "(Copy)"
