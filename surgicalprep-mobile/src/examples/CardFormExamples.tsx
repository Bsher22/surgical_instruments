/**
 * Stage 5A Example Usage
 * 
 * This file demonstrates how to use the card form state management
 * system in your screens and components.
 */

import React, { useEffect } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import {
  useCardFormStore,
  useCardFormData,
  useCardFormActions,
  useCardFormIsDirty,
  useCardFormErrors,
  useCardFormStatus,
  useCardFormVisibleItems,
} from '../stores/cardFormStore';
import {
  useCardFormAutoSave,
  formatLastSaved,
} from '../hooks/useCardFormAutoSave';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { useCardDraftRecovery } from '../hooks/useCardDraftRecovery';
import {
  formDataToCreateRequest,
  formDataToUpdateRequest,
} from '../utils/cardFormUtils';
import { ItemCategory } from '../types/cardForm';

/**
 * Example: New Card Screen
 * 
 * Shows the complete flow for creating a new preference card
 * with draft recovery, auto-save, and navigation guards.
 */
export function NewCardScreenExample() {
  const actions = useCardFormActions();
  const formData = useCardFormData();
  const errors = useCardFormErrors();
  const { lastSavedAt } = useCardFormStatus();

  // Check for existing draft and offer to restore
  const { isChecking } = useCardDraftRecovery({
    cardId: undefined, // New card
    onRestore: (draft) => {
      console.log('Restored draft:', draft.metadata.cardTitle);
    },
    onNoDraft: () => {
      // Initialize fresh form
      actions.initializeNewCard();
    },
  });

  // Enable auto-save
  useCardFormAutoSave({
    debounceMs: 2000,
    onSave: () => console.log('Draft saved'),
    onError: (error) => console.error('Auto-save failed:', error),
  });

  // Guard against accidental navigation
  useUnsavedChangesGuard({
    title: 'Discard New Card?',
    message: 'You have unsaved changes. Discard this card?',
    onDiscard: () => {
      // Navigate back
    },
  });

  // Show loading while checking for drafts
  if (isChecking) {
    return <Text>Loading...</Text>;
  }

  const handleSave = async () => {
    // Validate form
    if (!actions.validate()) {
      console.log('Validation failed');
      return;
    }

    // Prepare request
    const request = formDataToCreateRequest(formData);
    console.log('Create request:', request);

    // Call your API here
    // const result = await cardsApi.createCard(request);

    // Clear draft after successful save
    await actions.clearDraft();
    
    // Mark as saved (clears dirty flag)
    actions.markAsSaved();

    // Navigate to card detail
    // router.push(`/cards/${result.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Auto-save indicator */}
      {lastSavedAt && (
        <Text style={styles.autoSaveText}>
          {formatLastSaved(lastSavedAt)}
        </Text>
      )}

      {/* Title input */}
      <TextInput
        style={[styles.input, errors.title && styles.inputError]}
        placeholder="Card Title *"
        value={formData.title}
        onChangeText={(text) => actions.updateField('title', text)}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      {/* Surgeon name */}
      <TextInput
        style={styles.input}
        placeholder="Surgeon Name"
        value={formData.surgeonName}
        onChangeText={(text) => actions.updateField('surgeonName', text)}
      />

      {/* Add item button */}
      <Button
        title="Add Item"
        onPress={() =>
          actions.addItem({
            name: 'New Item',
            category: ItemCategory.INSTRUMENT,
          })
        }
      />

      {/* Save button */}
      <Button title="Save Card" onPress={handleSave} />
    </View>
  );
}

/**
 * Example: Edit Card Screen
 * 
 * Shows how to load an existing card for editing
 */
export function EditCardScreenExample({ cardId }: { cardId: string }) {
  const actions = useCardFormActions();
  const formData = useCardFormData();
  const { isLoading, isSaving } = useCardFormStatus();

  // Check for draft of this specific card
  const { isChecking } = useCardDraftRecovery({
    cardId,
    onRestore: (draft) => {
      console.log('Restored draft for card:', cardId);
    },
    onNoDraft: async () => {
      // Load card from API
      actions.setIsLoading(true);
      try {
        // const card = await cardsApi.getCard(cardId);
        // actions.initializeFromCard(card);
      } catch (error) {
        console.error('Failed to load card:', error);
      } finally {
        actions.setIsLoading(false);
      }
    },
  });

  // Enable auto-save
  useCardFormAutoSave();

  // Guard navigation
  useUnsavedChangesGuard();

  const handleSave = async () => {
    if (!actions.validate()) return;

    actions.setIsSaving(true);
    try {
      const request = formDataToUpdateRequest(formData);
      // await cardsApi.updateCard(cardId, request);
      await actions.clearDraft();
      actions.markAsSaved();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      actions.setIsSaving(false);
    }
  };

  if (isChecking || isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(text) => actions.updateField('title', text)}
      />
      <Button
        title={isSaving ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        disabled={isSaving}
      />
    </View>
  );
}

/**
 * Example: Item List Component
 * 
 * Shows how to use the items from the store
 */
export function ItemListExample() {
  const items = useCardFormVisibleItems();
  const actions = useCardFormActions();

  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemRow}>
          <Text>{item.name}</Text>
          <Text>Qty: {item.quantity}</Text>
          <Button
            title="Edit"
            onPress={() =>
              actions.updateItem(item.id, { quantity: item.quantity + 1 })
            }
          />
          <Button
            title="Remove"
            onPress={() => actions.removeItem(item.id)}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Example: Using Selectors Efficiently
 * 
 * Shows how to subscribe to specific slices of state
 * to avoid unnecessary re-renders
 */
export function EfficientComponentExample() {
  // Only re-render when title changes
  const title = useCardFormStore((state) => state.formData.title);
  const updateField = useCardFormStore((state) => state.updateField);

  return (
    <TextInput
      value={title}
      onChangeText={(text) => updateField('title', text)}
    />
  );
}

/**
 * Example: Full Store Access
 * 
 * When you need access to multiple state values
 */
export function FullAccessExample() {
  const {
    formData,
    isDirty,
    isEditing,
    validationErrors,
    updateField,
    validate,
    reset,
  } = useCardFormStore();

  // Use all the state and actions...
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  autoSaveText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
