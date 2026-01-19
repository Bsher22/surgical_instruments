/**
 * Card Item Types for SurgicalPrep
 * Matches backend Pydantic schemas for preference card items
 */

// Item categories for organizing preference card items
export type ItemCategory = 
  | 'instruments'
  | 'supplies'
  | 'sutures'
  | 'implants'
  | 'special';

export const ITEM_CATEGORIES: { value: ItemCategory; label: string; color: string }[] = [
  { value: 'instruments', label: 'Instruments', color: '#3B82F6' },
  { value: 'supplies', label: 'Supplies', color: '#10B981' },
  { value: 'sutures', label: 'Sutures', color: '#8B5CF6' },
  { value: 'implants', label: 'Implants', color: '#F59E0B' },
  { value: 'special', label: 'Special', color: '#EF4444' },
];

// Base interface for a preference card item
export interface CardItem {
  id: string;
  card_id: string;
  instrument_id?: string | null;
  custom_name?: string | null;
  quantity: number;
  size?: string | null;
  notes?: string | null;
  category: ItemCategory;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined instrument data (when fetched with instrument details)
  instrument?: {
    id: string;
    name: string;
    aliases?: string[];
    category: string;
    image_url?: string;
    thumbnail_url?: string;
  } | null;
}

// For creating a new item
export interface CardItemCreate {
  instrument_id?: string | null;
  custom_name?: string | null;
  quantity: number;
  size?: string | null;
  notes?: string | null;
  category: ItemCategory;
  sort_order?: number;
}

// For updating an existing item
export interface CardItemUpdate {
  id: string;
  quantity?: number;
  size?: string | null;
  notes?: string | null;
  category?: ItemCategory;
  sort_order?: number;
}

// For reordering items
export interface CardItemReorder {
  id: string;
  sort_order: number;
}

// Local state for item being edited
export interface CardItemDraft extends Omit<CardItemCreate, 'sort_order'> {
  id?: string; // Present if editing existing item
  displayName: string; // Computed from instrument or custom_name
  thumbnailUrl?: string;
}

// Search result when adding instruments
export interface InstrumentSearchResult {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  image_url?: string;
  thumbnail_url?: string;
  description?: string;
  is_premium: boolean;
}

// Custom item form state
export interface CustomItemFormData {
  name: string;
  quantity: number;
  size: string;
  notes: string;
  category: ItemCategory;
}

// Validation errors
export interface ItemValidationErrors {
  name?: string;
  quantity?: string;
  category?: string;
}

// Helper function to get display name for an item
export function getItemDisplayName(item: CardItem): string {
  if (item.custom_name) {
    return item.custom_name;
  }
  if (item.instrument?.name) {
    return item.instrument.name;
  }
  return 'Unknown Item';
}

// Helper to get category info
export function getCategoryInfo(category: ItemCategory) {
  return ITEM_CATEGORIES.find(c => c.value === category) || ITEM_CATEGORIES[0];
}

// Generate a temporary ID for new items before saving
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if an ID is temporary (not yet saved to backend)
export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}
