"""
Pydantic schemas for instrument-related requests and responses.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class InstrumentBase(BaseModel):
    name: str = Field(..., max_length=200)
    aliases: Optional[List[str]] = None
    category: str = Field(..., max_length=100)
    description: Optional[str] = None
    primary_uses: Optional[List[str]] = None
    common_procedures: Optional[List[str]] = None
    handling_notes: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_premium: bool = False


class InstrumentCreate(InstrumentBase):
    pass


class InstrumentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    aliases: Optional[List[str]] = None
    category: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    primary_uses: Optional[List[str]] = None
    common_procedures: Optional[List[str]] = None
    handling_notes: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_premium: Optional[bool] = None


class InstrumentResponse(InstrumentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InstrumentListResponse(BaseModel):
    id: str
    name: str
    category: str
    thumbnail_url: Optional[str] = None
    is_premium: bool
    
    class Config:
        from_attributes = True


class InstrumentSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class PaginatedInstruments(BaseModel):
    items: List[InstrumentListResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Category list
class CategoryResponse(BaseModel):
    name: str
    count: int
