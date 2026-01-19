// src/stores/cardFormStore.ts
// Zustand store for card create/edit form state management

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CardFormData,
  CardFormErrors,
  CardFormState,
  initialCardFormData,
  initialCardFormErrors,
} from '../types/cardForm';
import {
  validateCardForm,
  validateField,
  sanitizeCardFormData,
  hasValidationErrors,
} from '../utils/cardValidation';

const DRAFT_STORAGE_KEY = 'surgicalprep_card_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface CardFormStore extends CardFormState {
  // Actions
  setField: (field: keyof CardFormData, value: string) => void;
  setData: (data: Partial<CardFormData>) => void;
  setErrors: (errors: CardFormErrors) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Validation
  validateForm: () => boolean;
  validateSingleField: (field: keyof CardFormData) => void;
  clearFieldError: (field: keyof CardFormData) => void;

  // Form lifecycle
  initializeForm: (data?: Partial<CardFormData>) => void;
  resetForm: () => void;
  getSubmitData: () => CardFormData;

  // Draft management
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
  hasDraft: () => Promise<boolean>;
}

export const useCardFormStore = create<CardFormStore>((set, get) => ({
  // Initial state
  data: initialCardFormData,
  errors: initialCardFormErrors,
  isDirty: false,
  isSubmitting: false,
  isLoading: false,

  // Set a single field value
  setField: (field, value) => {
    set((state) => ({
      data: { ...state.data, [field]: value },
      isDirty: true,
      // Clear error when user starts typing
      errors: { ...state.errors, [field]: undefined },
    }));
  },

  // Set multiple fields at once
  setData: (data) => {
    set((state) => ({
      data: { ...state.data, ...data },
      isDirty: true,
    }));
  },

  // Set validation errors
  setErrors: (errors) => {
    set({ errors });
  },

  // Set submitting state
  setIsSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },

  // Set loading state
  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  // Validate entire form
  validateForm: () => {
    const { data } = get();
    const errors = validateCardForm(data);
    set({ errors });
    return !hasValidationErrors(errors);
  },

  // Validate a single field (on blur)
  validateSingleField: (field) => {
    const { data, errors } = get();
    const fieldError = validateField(field, data[field]);
    set({
      errors: { ...errors, [field]: fieldError },
    });
  },

  // Clear a specific field error
  clearFieldError: (field) => {
    set((state) => ({
      errors: { ...state.errors, [field]: undefined },
    }));
  },

  // Initialize form with optional data (for edit mode)
  initializeForm: (data) => {
    set({
      data: data ? { ...initialCardFormData, ...data } : initialCardFormData,
      errors: initialCardFormErrors,
      isDirty: false,
      isSubmitting: false,
      isLoading: false,
    });
  },

  // Reset form to initial state
  resetForm: () => {
    set({
      data: initialCardFormData,
      errors: initialCardFormErrors,
      isDirty: false,
      isSubmitting: false,
      isLoading: false,
    });
  },

  // Get sanitized data for submission
  getSubmitData: () => {
    const { data } = get();
    return sanitizeCardFormData(data);
  },

  // Save draft to AsyncStorage
  saveDraft: async () => {
    try {
      const { data, isDirty } = get();
      if (!isDirty) return;

      const draft = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  // Load draft from AsyncStorage
  loadDraft: async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) return false;

      const draft = JSON.parse(draftJson);

      // Check if draft is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - draft.timestamp > maxAge) {
        await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
        return false;
      }

      set({
        data: { ...initialCardFormData, ...draft.data },
        isDirty: true,
      });
      return true;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return false;
    }
  },

  // Clear draft from AsyncStorage
  clearDraft: async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },

  // Check if draft exists
  hasDraft: async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) return false;

      const draft = JSON.parse(draftJson);
      const maxAge = 24 * 60 * 60 * 1000;
      return Date.now() - draft.timestamp <= maxAge;
    } catch {
      return false;
    }
  },
}));

// Auto-save interval handler (call in component useEffect)
let autoSaveInterval: NodeJS.Timeout | null = null;

export function startAutoSave() {
  if (autoSaveInterval) return;

  autoSaveInterval = setInterval(() => {
    const store = useCardFormStore.getState();
    if (store.isDirty) {
      store.saveDraft();
    }
  }, AUTO_SAVE_INTERVAL);
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}
