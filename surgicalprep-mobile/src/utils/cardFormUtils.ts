/**
 * Card Form Utility Functions
 * 
 * Helper functions for card form state management including
 * data transformation, validation, and comparison utilities.
 */

import {
  CardFormData,
  CardFormItem,
  CardFormPhoto,
  FormValidationErrors,
  ItemCategory,
  PreferenceCardWithItems,
  PreferenceCardItem,
  CreatePreferenceCardRequest,
  UpdatePreferenceCardRequest,
  CreateCardItemRequest,
  UpdateCardItemRequest,
} from '../types/cardForm';
import { Specialty } from '../types';

/**
 * Generate a unique ID for form items
 */
export function generateItemId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for photos
 */
export function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create an empty form data object for new cards
 */
export function createEmptyFormData(): CardFormData {
  return {
    id: undefined,
    title: '',
    surgeonName: '',
    procedureName: '',
    specialty: null,
    generalNotes: '',
    setupNotes: '',
    items: [],
    photos: [],
  };
}

/**
 * Create a default new item
 */
export function createDefaultItem(
  overrides: Partial<CardFormItem> = {}
): CardFormItem {
  return {
    id: generateItemId(),
    instrumentId: null,
    name: '',
    quantity: 1,
    size: '',
    notes: '',
    category: ItemCategory.OTHER,
    isCustom: true,
    order: 0,
    isNew: true,
    isDeleted: false,
    ...overrides,
  };
}

/**
 * Map API category string to ItemCategory enum
 */
export function mapCategoryFromApi(category: string): ItemCategory {
  const normalized = category.toLowerCase();
  switch (normalized) {
    case 'instrument':
      return ItemCategory.INSTRUMENT;
    case 'supply':
      return ItemCategory.SUPPLY;
    case 'suture':
      return ItemCategory.SUTURE;
    case 'implant':
      return ItemCategory.IMPLANT;
    case 'special':
      return ItemCategory.SPECIAL;
    default:
      return ItemCategory.OTHER;
  }
}

/**
 * Map ItemCategory enum to API category string
 */
export function mapCategoryToApi(category: ItemCategory): string {
  return category.toLowerCase();
}

/**
 * Convert API preference card to form data
 */
export function cardToFormData(card: PreferenceCardWithItems): CardFormData {
  return {
    id: card.id,
    title: card.title,
    surgeonName: card.surgeon_name || '',
    procedureName: card.procedure_name || '',
    specialty: card.specialty || null,
    generalNotes: card.general_notes || '',
    setupNotes: card.setup_notes || '',
    items: (card.items || []).map((item, index) => 
      apiItemToFormItem(item, index)
    ),
    photos: (card.photos || []).map((photo) => 
      apiPhotoToFormPhoto(photo)
    ),
  };
}

/**
 * Convert API item to form item
 */
export function apiItemToFormItem(
  item: PreferenceCardItem,
  orderOverride?: number
): CardFormItem {
  const isCustom = !item.instrument_id;
  return {
    id: item.id,
    instrumentId: item.instrument_id || null,
    name: item.instrument?.name || item.custom_item_name || '',
    quantity: item.quantity,
    size: item.size || '',
    notes: item.notes || '',
    category: mapCategoryFromApi(item.category),
    isCustom,
    order: orderOverride ?? item.display_order,
    isNew: false,
    isDeleted: false,
  };
}

/**
 * Convert API photo to form photo
 */
export function apiPhotoToFormPhoto(
  photo: { id: string; photo_url: string }
): CardFormPhoto {
  return {
    id: photo.id,
    uri: photo.photo_url,
    isNew: false,
    isDeleted: false,
  };
}

/**
 * Convert form data to create request
 */
export function formDataToCreateRequest(
  data: CardFormData
): CreatePreferenceCardRequest {
  // Filter out deleted items and map to API format
  const items: CreateCardItemRequest[] = data.items
    .filter((item) => !item.isDeleted)
    .map((item, index) => ({
      instrument_id: item.instrumentId || undefined,
      custom_item_name: item.isCustom ? item.name : undefined,
      quantity: item.quantity,
      size: item.size || undefined,
      notes: item.notes || undefined,
      category: mapCategoryToApi(item.category),
      display_order: index,
    }));

  return {
    title: data.title.trim(),
    surgeon_name: data.surgeonName.trim() || undefined,
    procedure_name: data.procedureName.trim() || undefined,
    specialty: data.specialty || undefined,
    general_notes: data.generalNotes.trim() || undefined,
    setup_notes: data.setupNotes.trim() || undefined,
    items,
  };
}

/**
 * Convert form data to update request
 */
export function formDataToUpdateRequest(
  data: CardFormData
): UpdatePreferenceCardRequest {
  // Get deleted item IDs (only for existing items)
  const deletedItemIds = data.items
    .filter((item) => item.isDeleted && !item.isNew)
    .map((item) => item.id);

  // Map non-deleted items to API format
  const items: UpdateCardItemRequest[] = data.items
    .filter((item) => !item.isDeleted)
    .map((item, index) => ({
      id: item.isNew ? undefined : item.id,
      instrument_id: item.instrumentId || undefined,
      custom_item_name: item.isCustom ? item.name : undefined,
      quantity: item.quantity,
      size: item.size || undefined,
      notes: item.notes || undefined,
      category: mapCategoryToApi(item.category),
      display_order: index,
    }));

  return {
    title: data.title.trim(),
    surgeon_name: data.surgeonName.trim() || undefined,
    procedure_name: data.procedureName.trim() || undefined,
    specialty: data.specialty || undefined,
    general_notes: data.generalNotes.trim() || undefined,
    setup_notes: data.setupNotes.trim() || undefined,
    items,
    deleted_item_ids: deletedItemIds.length > 0 ? deletedItemIds : undefined,
  };
}

/**
 * Validate form data and return errors
 */
export function validateFormData(data: CardFormData): FormValidationErrors {
  const errors: FormValidationErrors = {};

  // Title is required
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  // Surgeon name validation (optional but has max length)
  if (data.surgeonName.length > 100) {
    errors.surgeonName = 'Surgeon name must be less than 100 characters';
  }

  // Procedure name validation (optional but has max length)
  if (data.procedureName.length > 200) {
    errors.procedureName = 'Procedure name must be less than 200 characters';
  }

  // Items validation
  const activeItems = data.items.filter((item) => !item.isDeleted);
  if (activeItems.length === 0) {
    // Items are optional but we might want to warn
    // errors.items = 'Add at least one item to the card';
  }

  // Validate each item
  const itemsWithErrors = activeItems.filter((item) => {
    if (!item.name.trim()) return true;
    if (item.quantity < 1) return true;
    return false;
  });

  if (itemsWithErrors.length > 0) {
    errors.items = `${itemsWithErrors.length} item(s) have invalid data`;
  }

  return errors;
}

/**
 * Check if form data has validation errors
 */
export function hasValidationErrors(errors: FormValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Deep compare two CardFormData objects for equality
 * Used to detect if form has unsaved changes
 */
export function deepCompareFormData(
  a: CardFormData | null,
  b: CardFormData | null
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;

  // Compare primitive fields
  if (a.id !== b.id) return false;
  if (a.title !== b.title) return false;
  if (a.surgeonName !== b.surgeonName) return false;
  if (a.procedureName !== b.procedureName) return false;
  if (a.specialty !== b.specialty) return false;
  if (a.generalNotes !== b.generalNotes) return false;
  if (a.setupNotes !== b.setupNotes) return false;

  // Compare items (excluding isNew and order for dirty detection)
  const aItems = a.items.filter((item) => !item.isDeleted);
  const bItems = b.items.filter((item) => !item.isDeleted);

  if (aItems.length !== bItems.length) return false;

  for (let i = 0; i < aItems.length; i++) {
    if (!compareItems(aItems[i], bItems[i])) return false;
  }

  // Compare photos
  const aPhotos = a.photos.filter((photo) => !photo.isDeleted);
  const bPhotos = b.photos.filter((photo) => !photo.isDeleted);

  if (aPhotos.length !== bPhotos.length) return false;

  for (let i = 0; i < aPhotos.length; i++) {
    if (!comparePhotos(aPhotos[i], bPhotos[i])) return false;
  }

  return true;
}

/**
 * Compare two form items for equality
 */
function compareItems(a: CardFormItem, b: CardFormItem): boolean {
  return (
    a.name === b.name &&
    a.quantity === b.quantity &&
    a.size === b.size &&
    a.notes === b.notes &&
    a.category === b.category &&
    a.instrumentId === b.instrumentId &&
    a.order === b.order
  );
}

/**
 * Compare two form photos for equality
 */
function comparePhotos(a: CardFormPhoto, b: CardFormPhoto): boolean {
  return a.uri === b.uri;
}

/**
 * Get draft storage key for a card
 */
export function getDraftKey(cardId?: string): string {
  return cardId ? `card_draft_${cardId}` : 'card_draft_new';
}

/**
 * Get list of all possible draft keys for cleanup
 */
export function getDraftKeyPattern(): string {
  return 'card_draft_';
}

/**
 * Calculate the number of items by category
 */
export function getItemCountsByCategory(
  items: CardFormItem[]
): Record<ItemCategory, number> {
  const counts: Record<ItemCategory, number> = {
    [ItemCategory.INSTRUMENT]: 0,
    [ItemCategory.SUPPLY]: 0,
    [ItemCategory.SUTURE]: 0,
    [ItemCategory.IMPLANT]: 0,
    [ItemCategory.SPECIAL]: 0,
    [ItemCategory.OTHER]: 0,
  };

  items
    .filter((item) => !item.isDeleted)
    .forEach((item) => {
      counts[item.category]++;
    });

  return counts;
}

/**
 * Get items grouped by category for display
 */
export function getItemsGroupedByCategory(
  items: CardFormItem[]
): Map<ItemCategory, CardFormItem[]> {
  const groups = new Map<ItemCategory, CardFormItem[]>();

  // Initialize all categories
  Object.values(ItemCategory).forEach((category) => {
    groups.set(category, []);
  });

  // Group items
  items
    .filter((item) => !item.isDeleted)
    .sort((a, b) => a.order - b.order)
    .forEach((item) => {
      const categoryItems = groups.get(item.category) || [];
      categoryItems.push(item);
      groups.set(item.category, categoryItems);
    });

  return groups;
}

/**
 * Get display label for item category
 */
export function getCategoryLabel(category: ItemCategory): string {
  switch (category) {
    case ItemCategory.INSTRUMENT:
      return 'Instruments';
    case ItemCategory.SUPPLY:
      return 'Supplies';
    case ItemCategory.SUTURE:
      return 'Sutures';
    case ItemCategory.IMPLANT:
      return 'Implants';
    case ItemCategory.SPECIAL:
      return 'Special Items';
    case ItemCategory.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}

/**
 * Get specialty options for dropdown
 */
export function getSpecialtyOptions(): { label: string; value: Specialty }[] {
  return [
    { label: 'General Surgery', value: 'general' as Specialty },
    { label: 'Orthopedic', value: 'orthopedic' as Specialty },
    { label: 'Cardiovascular', value: 'cardiovascular' as Specialty },
    { label: 'Neurosurgery', value: 'neurosurgery' as Specialty },
    { label: 'OB/GYN', value: 'ob_gyn' as Specialty },
    { label: 'Urology', value: 'urology' as Specialty },
    { label: 'Plastic Surgery', value: 'plastic' as Specialty },
    { label: 'ENT', value: 'ent' as Specialty },
    { label: 'Ophthalmology', value: 'ophthalmology' as Specialty },
    { label: 'Other', value: 'other' as Specialty },
  ];
}

/**
 * Reorder array items (for drag and drop)
 */
export function reorderArray<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Update order values after reordering
 */
export function updateItemOrders(items: CardFormItem[]): CardFormItem[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}
