// src/hooks/useCardForm.ts
// Custom hook for card form state management and operations

import { useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useCardFormStore,
  startAutoSave,
  stopAutoSave,
} from '../stores/cardFormStore';
import { CardFormData } from '../types/cardForm';
import { createCard, updateCard } from '../api/cards';
import type { PreferenceCard, CreateCardRequest, UpdateCardRequest } from '../types';

interface UseCardFormOptions {
  mode: 'create' | 'edit';
  cardId?: string;
  initialData?: Partial<CardFormData>;
  onSuccess?: (card: PreferenceCard) => void;
}

interface UseCardFormReturn {
  // Form state
  data: CardFormData;
  errors: ReturnType<typeof useCardFormStore>['errors'];
  isDirty: boolean;
  isSubmitting: boolean;
  isLoading: boolean;

  // Field handlers
  handleFieldChange: (field: keyof CardFormData, value: string) => void;
  handleFieldBlur: (field: keyof CardFormData) => void;

  // Form actions
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleReset: () => void;

  // Draft
  hasDraft: boolean;
  restoreDraft: () => Promise<void>;
  dismissDraft: () => Promise<void>;
}

export function useCardForm(options: UseCardFormOptions): UseCardFormReturn {
  const { mode, cardId, initialData, onSuccess } = options;
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasDraftRef = useRef(false);

  const {
    data,
    errors,
    isDirty,
    isSubmitting,
    isLoading,
    setField,
    validateForm,
    validateSingleField,
    setIsSubmitting,
    initializeForm,
    resetForm,
    getSubmitData,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft: checkHasDraft,
  } = useCardFormStore();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCardRequest) => createCard(data),
    onSuccess: (card) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      clearDraft();
      onSuccess?.(card);
      router.replace(`/cards/${card.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardRequest }) =>
      updateCard(id, data),
    onSuccess: (card) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['card', cardId] });
      clearDraft();
      onSuccess?.(card);
      router.back();
    },
  });

  // Initialize form on mount
  useEffect(() => {
    initializeForm(initialData);

    // Start auto-save for create mode
    if (mode === 'create') {
      startAutoSave();
    }

    return () => {
      stopAutoSave();
    };
  }, [mode, initialData, initializeForm]);

  // Check for draft on mount (create mode only)
  useEffect(() => {
    if (mode === 'create') {
      checkHasDraft().then((has) => {
        hasDraftRef.current = has;
        if (has) {
          Alert.alert(
            'Restore Draft?',
            'You have an unsaved draft. Would you like to restore it?',
            [
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => clearDraft(),
              },
              {
                text: 'Restore',
                onPress: () => loadDraft(),
              },
            ]
          );
        }
      });
    }
  }, [mode, checkHasDraft, loadDraft, clearDraft]);

  // Handle field change
  const handleFieldChange = useCallback(
    (field: keyof CardFormData, value: string) => {
      setField(field, value);
    },
    [setField]
  );

  // Handle field blur (validate on blur)
  const handleFieldBlur = useCallback(
    (field: keyof CardFormData) => {
      validateSingleField(field);
    },
    [validateSingleField]
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = getSubmitData();

      // Convert to API request format
      const apiData = {
        title: submitData.title,
        surgeon_name: submitData.surgeonName || undefined,
        procedure_name: submitData.procedureName || undefined,
        specialty: submitData.specialty || undefined,
        general_notes: submitData.generalNotes || undefined,
        setup_notes: submitData.setupNotes || undefined,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(apiData as CreateCardRequest);
      } else if (cardId) {
        await updateMutation.mutateAsync({
          id: cardId,
          data: apiData as UpdateCardRequest,
        });
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      Alert.alert(
        'Error',
        'Failed to save the card. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    mode,
    cardId,
    validateForm,
    setIsSubmitting,
    getSubmitData,
    createMutation,
    updateMutation,
  ]);

  // Handle cancel with confirmation if dirty
  const handleCancel = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              clearDraft();
              resetForm();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, clearDraft, resetForm, router]);

  // Handle form reset
  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Form?',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearDraft();
            initializeForm(initialData);
          },
        },
      ]
    );
  }, [clearDraft, initializeForm, initialData]);

  // Restore draft
  const restoreDraft = useCallback(async () => {
    await loadDraft();
  }, [loadDraft]);

  // Dismiss draft
  const dismissDraft = useCallback(async () => {
    await clearDraft();
    hasDraftRef.current = false;
  }, [clearDraft]);

  return {
    data,
    errors,
    isDirty,
    isSubmitting:
      isSubmitting || createMutation.isPending || updateMutation.isPending,
    isLoading,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    handleCancel,
    handleReset,
    hasDraft: hasDraftRef.current,
    restoreDraft,
    dismissDraft,
  };
}

// Hook for handling back navigation with unsaved changes
export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    // This would need to be implemented with navigation listeners
    // For Expo Router, we handle this in the cancel action
  }, [isDirty, router]);
}
