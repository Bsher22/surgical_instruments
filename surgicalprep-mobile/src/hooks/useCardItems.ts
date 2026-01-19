/**
 * useCardItems Hook
 * Manages card items state with optimistic updates, reordering, and sync
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CardItem,
  CardItemCreate,
  CardItemDraft,
  CardItemUpdate,
  InstrumentSearchResult,
  CustomItemFormData,
  ItemCategory,
} from '../types/cardItems';
import { generateTempId, isTempId } from '../types/cardItems';
import {
  createDraftFromInstrument,
  createDraftFromCustom,
  createTempItem,
  draftToCreate,
  moveItem,
  getNextSortOrder,
  isInstrumentInList,
  getItemsToSync,
  recalculateSortOrders,
  validateCustomItem,
} from '../utils/cardItemHelpers';

// Draft storage key prefix
const DRAFT_KEY_PREFIX = 'card_items_draft_';

interface UseCardItemsOptions {
  cardId: string;
  initialItems?: CardItem[];
  onItemsChange?: (items: CardItem[]) => void;
  autoSaveDraft?: boolean;
}

interface UseCardItemsReturn {
  // State
  items: CardItem[];
  isModified: boolean;
  isSaving: boolean;
  
  // Item operations
  addInstrument: (instrument: InstrumentSearchResult, quantity?: number, category?: ItemCategory) => void;
  addCustomItem: (data: CustomItemFormData) => { success: boolean; errors?: Record<string, string> };
  updateItem: (id: string, updates: Partial<CardItemUpdate>) => void;
  removeItem: (id: string) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  
  // Bulk operations
  setItems: (items: CardItem[]) => void;
  clearItems: () => void;
  resetToOriginal: () => void;
  
  // Sync
  getChanges: () => { toCreate: CardItem[]; toUpdate: CardItem[]; toDelete: string[] };
  markAsSaved: (savedItems: CardItem[]) => void;
  
  // Draft persistence
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
  
  // Helpers
  isInstrumentAdded: (instrumentId: string) => boolean;
}

export function useCardItems({
  cardId,
  initialItems = [],
  onItemsChange,
  autoSaveDraft = true,
}: UseCardItemsOptions): UseCardItemsReturn {
  // Current items state
  const [items, setItemsState] = useState<CardItem[]>(initialItems);
  
  // Original items for tracking modifications
  const originalItemsRef = useRef<CardItem[]>(initialItems);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Draft save timeout
  const draftSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check if items have been modified
  const isModified = useMemo(() => {
    if (items.length !== originalItemsRef.current.length) return true;
    
    const originalIds = new Set(originalItemsRef.current.map(i => i.id));
    const currentIds = new Set(items.map(i => i.id));
    
    // Check for new or removed items
    if (items.some(i => !originalIds.has(i.id) || isTempId(i.id))) return true;
    if (originalItemsRef.current.some(i => !currentIds.has(i.id))) return true;
    
    // Check for modifications
    const originalMap = new Map(originalItemsRef.current.map(i => [i.id, i]));
    return items.some(item => {
      const original = originalMap.get(item.id);
      if (!original) return true;
      return (
        item.quantity !== original.quantity ||
        item.size !== original.size ||
        item.notes !== original.notes ||
        item.category !== original.category ||
        item.sort_order !== original.sort_order
      );
    });
  }, [items]);

  // Update items with callback
  const updateItems = useCallback((newItems: CardItem[]) => {
    setItemsState(newItems);
    onItemsChange?.(newItems);
    
    // Auto-save draft with debounce
    if (autoSaveDraft) {
      if (draftSaveTimeout.current) {
        clearTimeout(draftSaveTimeout.current);
      }
      draftSaveTimeout.current = setTimeout(() => {
        saveDraftInternal(newItems);
      }, 2000);
    }
  }, [onItemsChange, autoSaveDraft]);

  // Add instrument from search
  const addInstrument = useCallback((
    instrument: InstrumentSearchResult,
    quantity: number = 1,
    category?: ItemCategory
  ) => {
    // Check if already added
    if (isInstrumentInList(items, instrument.id)) {
      Alert.alert(
        'Already Added',
        `${instrument.name} is already in this card. You can update its quantity instead.`
      );
      return;
    }

    const draft = createDraftFromInstrument(instrument, quantity, category);
    const sortOrder = getNextSortOrder(items);
    const newItem = createTempItem(draft, cardId, sortOrder);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateItems([...items, newItem]);
  }, [items, cardId, updateItems]);

  // Add custom item
  const addCustomItem = useCallback((data: CustomItemFormData) => {
    const errors = validateCustomItem(data);
    
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    const draft = createDraftFromCustom(data);
    const sortOrder = getNextSortOrder(items);
    const newItem = createTempItem(draft, cardId, sortOrder);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateItems([...items, newItem]);
    
    return { success: true };
  }, [items, cardId, updateItems]);

  // Update existing item
  const updateItem = useCallback((id: string, updates: Partial<CardItemUpdate>) => {
    const updatedItems = items.map(item => {
      if (item.id !== id) return item;
      
      return {
        ...item,
        ...updates,
        updated_at: new Date().toISOString(),
      };
    });
    
    updateItems(updatedItems);
  }, [items, updateItems]);

  // Remove item
  const removeItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    Alert.alert(
      'Remove Item',
      `Remove "${item.custom_name || item.instrument?.name || 'this item'}" from the card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const filtered = items.filter(i => i.id !== id);
            // Recalculate sort orders
            const reordered = filtered.map((item, index) => ({
              ...item,
              sort_order: index,
            }));
            updateItems(reordered);
          },
        },
      ]
    );
  }, [items, updateItems]);

  // Reorder items (for drag and drop)
  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reordered = moveItem(items, fromIndex, toIndex);
    updateItems(reordered);
  }, [items, updateItems]);

  // Set items directly
  const setItems = useCallback((newItems: CardItem[]) => {
    updateItems(newItems);
  }, [updateItems]);

  // Clear all items
  const clearItems = useCallback(() => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to remove all items from this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            updateItems([]);
          },
        },
      ]
    );
  }, [updateItems]);

  // Reset to original items
  const resetToOriginal = useCallback(() => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard all changes to items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            updateItems([...originalItemsRef.current]);
          },
        },
      ]
    );
  }, [updateItems]);

  // Get changes for sync
  const getChanges = useCallback(() => {
    return getItemsToSync(items, originalItemsRef.current);
  }, [items]);

  // Mark items as saved (update original reference)
  const markAsSaved = useCallback((savedItems: CardItem[]) => {
    originalItemsRef.current = savedItems;
    setItemsState(savedItems);
  }, []);

  // Draft persistence - internal save
  const saveDraftInternal = async (itemsToSave: CardItem[]) => {
    try {
      const key = `${DRAFT_KEY_PREFIX}${cardId}`;
      await AsyncStorage.setItem(key, JSON.stringify(itemsToSave));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Draft persistence - public save
  const saveDraft = useCallback(async () => {
    await saveDraftInternal(items);
  }, [items, cardId]);

  // Load draft
  const loadDraft = useCallback(async (): Promise<boolean> => {
    try {
      const key = `${DRAFT_KEY_PREFIX}${cardId}`;
      const saved = await AsyncStorage.getItem(key);
      
      if (saved) {
        const draftItems = JSON.parse(saved) as CardItem[];
        if (draftItems.length > 0) {
          setItemsState(draftItems);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return false;
    }
  }, [cardId]);

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      const key = `${DRAFT_KEY_PREFIX}${cardId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [cardId]);

  // Check if instrument is already in list
  const isInstrumentAdded = useCallback((instrumentId: string): boolean => {
    return isInstrumentInList(items, instrumentId);
  }, [items]);

  return {
    items,
    isModified,
    isSaving,
    addInstrument,
    addCustomItem,
    updateItem,
    removeItem,
    reorderItems,
    setItems,
    clearItems,
    resetToOriginal,
    getChanges,
    markAsSaved,
    saveDraft,
    loadDraft,
    clearDraft,
    isInstrumentAdded,
  };
}
