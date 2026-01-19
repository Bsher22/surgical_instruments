/**
 * Card Item Helper Utilities
 * Functions for managing, validating, and transforming card items
 */

import type {
  CardItem,
  CardItemCreate,
  CardItemDraft,
  CardItemReorder,
  CustomItemFormData,
  ItemCategory,
  ItemValidationErrors,
  InstrumentSearchResult,
} from '../types/cardItems';
import { generateTempId, isTempId } from '../types/cardItems';

/**
 * Validates custom item form data
 */
export function validateCustomItem(data: CustomItemFormData): ItemValidationErrors {
  const errors: ItemValidationErrors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Item name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters';
  } else if (data.name.trim().length > 200) {
    errors.name = 'Item name must be less than 200 characters';
  }

  if (data.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1';
  } else if (data.quantity > 999) {
    errors.quantity = 'Quantity must be less than 1000';
  }

  return errors;
}

/**
 * Creates a CardItemDraft from an instrument search result
 */
export function createDraftFromInstrument(
  instrument: InstrumentSearchResult,
  quantity: number = 1,
  category?: ItemCategory
): CardItemDraft {
  // Determine category from instrument category or default
  const itemCategory: ItemCategory = category || mapInstrumentCategory(instrument.category);

  return {
    instrument_id: instrument.id,
    custom_name: null,
    quantity,
    size: null,
    notes: null,
    category: itemCategory,
    displayName: instrument.name,
    thumbnailUrl: instrument.thumbnail_url,
  };
}

/**
 * Creates a CardItemDraft from custom item form data
 */
export function createDraftFromCustom(data: CustomItemFormData): CardItemDraft {
  return {
    instrument_id: null,
    custom_name: data.name.trim(),
    quantity: data.quantity,
    size: data.size.trim() || null,
    notes: data.notes.trim() || null,
    category: data.category,
    displayName: data.name.trim(),
    thumbnailUrl: undefined,
  };
}

/**
 * Maps backend instrument category to item category
 */
export function mapInstrumentCategory(instrumentCategory: string): ItemCategory {
  const categoryMap: Record<string, ItemCategory> = {
    'cutting': 'instruments',
    'grasping': 'instruments',
    'clamping': 'instruments',
    'retracting': 'instruments',
    'probing': 'instruments',
    'suturing': 'sutures',
    'specialty': 'special',
    'implant': 'implants',
    'supply': 'supplies',
  };

  const normalized = instrumentCategory.toLowerCase();
  return categoryMap[normalized] || 'instruments';
}

/**
 * Converts a CardItemDraft to CardItemCreate for API submission
 */
export function draftToCreate(draft: CardItemDraft, sortOrder: number): CardItemCreate {
  return {
    instrument_id: draft.instrument_id,
    custom_name: draft.custom_name,
    quantity: draft.quantity,
    size: draft.size,
    notes: draft.notes,
    category: draft.category,
    sort_order: sortOrder,
  };
}

/**
 * Creates a temporary CardItem from a draft (for optimistic UI)
 */
export function createTempItem(draft: CardItemDraft, cardId: string, sortOrder: number): CardItem {
  const now = new Date().toISOString();
  
  return {
    id: generateTempId(),
    card_id: cardId,
    instrument_id: draft.instrument_id,
    custom_name: draft.custom_name,
    quantity: draft.quantity,
    size: draft.size,
    notes: draft.notes,
    category: draft.category,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
    instrument: draft.instrument_id ? {
      id: draft.instrument_id,
      name: draft.displayName,
      category: draft.category,
      thumbnail_url: draft.thumbnailUrl,
    } : null,
  };
}

/**
 * Groups items by category for display
 */
export function groupItemsByCategory(items: CardItem[]): Map<ItemCategory, CardItem[]> {
  const groups = new Map<ItemCategory, CardItem[]>();
  
  // Initialize all categories
  const categoryOrder: ItemCategory[] = ['instruments', 'supplies', 'sutures', 'implants', 'special'];
  categoryOrder.forEach(cat => groups.set(cat, []));

  // Sort items by sort_order then group
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  
  sorted.forEach(item => {
    const categoryItems = groups.get(item.category) || [];
    categoryItems.push(item);
    groups.set(item.category, categoryItems);
  });

  return groups;
}

/**
 * Recalculates sort orders after reordering
 */
export function recalculateSortOrders(items: CardItem[]): CardItemReorder[] {
  return items.map((item, index) => ({
    id: item.id,
    sort_order: index,
  }));
}

/**
 * Moves an item from one position to another
 */
export function moveItem(items: CardItem[], fromIndex: number, toIndex: number): CardItem[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Update sort_order for all items
  return result.map((item, index) => ({
    ...item,
    sort_order: index,
  }));
}

/**
 * Filters items that need to be synced to backend
 * (items with temp IDs or modified sort orders)
 */
export function getItemsToSync(
  currentItems: CardItem[],
  originalItems: CardItem[]
): {
  toCreate: CardItem[];
  toUpdate: CardItem[];
  toDelete: string[];
} {
  const originalMap = new Map(originalItems.map(item => [item.id, item]));
  const currentMap = new Map(currentItems.map(item => [item.id, item]));

  const toCreate: CardItem[] = [];
  const toUpdate: CardItem[] = [];
  const toDelete: string[] = [];

  // Find items to create and update
  currentItems.forEach(item => {
    if (isTempId(item.id)) {
      toCreate.push(item);
    } else {
      const original = originalMap.get(item.id);
      if (original && hasItemChanged(original, item)) {
        toUpdate.push(item);
      }
    }
  });

  // Find items to delete
  originalItems.forEach(item => {
    if (!isTempId(item.id) && !currentMap.has(item.id)) {
      toDelete.push(item.id);
    }
  });

  return { toCreate, toUpdate, toDelete };
}

/**
 * Checks if an item has been modified
 */
function hasItemChanged(original: CardItem, current: CardItem): boolean {
  return (
    original.quantity !== current.quantity ||
    original.size !== current.size ||
    original.notes !== current.notes ||
    original.category !== current.category ||
    original.sort_order !== current.sort_order
  );
}

/**
 * Checks if an instrument is already in the items list
 */
export function isInstrumentInList(items: CardItem[], instrumentId: string): boolean {
  return items.some(item => item.instrument_id === instrumentId);
}

/**
 * Gets the next sort order for a new item
 */
export function getNextSortOrder(items: CardItem[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.sort_order)) + 1;
}

/**
 * Formats quantity display (e.g., "2x" or "1")
 */
export function formatQuantity(quantity: number): string {
  return quantity > 1 ? `${quantity}x` : '';
}

/**
 * Formats item details for display (size + notes preview)
 */
export function formatItemDetails(item: CardItem): string {
  const parts: string[] = [];
  
  if (item.size) {
    parts.push(item.size);
  }
  
  if (item.notes) {
    // Truncate notes for preview
    const truncated = item.notes.length > 50 
      ? `${item.notes.substring(0, 47)}...` 
      : item.notes;
    parts.push(truncated);
  }

  return parts.join(' • ');
}

/**
 * Default values for custom item form
 */
export const DEFAULT_CUSTOM_ITEM: CustomItemFormData = {
  name: '',
  quantity: 1,
  size: '',
  notes: '',
  category: 'supplies',
};

/**
 * Debounce helper for search
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}
