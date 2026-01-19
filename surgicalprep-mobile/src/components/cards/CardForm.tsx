// src/components/cards/CardForm.tsx
// Main form component for creating/editing preference cards

import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormInput, FormTextArea, FormSection } from '../ui';
import { SpecialtyPicker } from './SpecialtyPicker';
import { CardFormData, CardFormErrors, CARD_FORM_CONSTRAINTS } from '../../types/cardForm';

interface CardFormProps {
  data: CardFormData;
  errors: CardFormErrors;
  onFieldChange: (field: keyof CardFormData, value: string) => void;
  onFieldBlur: (field: keyof CardFormData) => void;
  isSubmitting?: boolean;
}

export const CardForm: React.FC<CardFormProps> = memo(
  ({ data, errors, onFieldChange, onFieldBlur, isSubmitting = false }) => {
    const insets = useSafeAreaInsets();

    // Refs for keyboard navigation
    const surgeonNameRef = useRef<TextInput>(null);
    const procedureNameRef = useRef<TextInput>(null);
    const generalNotesRef = useRef<TextInput>(null);
    const setupNotesRef = useRef<TextInput>(null);

    // Field change handlers
    const handleTitleChange = useCallback(
      (value: string) => onFieldChange('title', value),
      [onFieldChange]
    );

    const handleSurgeonNameChange = useCallback(
      (value: string) => onFieldChange('surgeonName', value),
      [onFieldChange]
    );

    const handleProcedureNameChange = useCallback(
      (value: string) => onFieldChange('procedureName', value),
      [onFieldChange]
    );

    const handleSpecialtyChange = useCallback(
      (value: string) => onFieldChange('specialty', value),
      [onFieldChange]
    );

    const handleGeneralNotesChange = useCallback(
      (value: string) => onFieldChange('generalNotes', value),
      [onFieldChange]
    );

    const handleSetupNotesChange = useCallback(
      (value: string) => onFieldChange('setupNotes', value),
      [onFieldChange]
    );

    // Blur handlers
    const handleTitleBlur = useCallback(
      () => onFieldBlur('title'),
      [onFieldBlur]
    );

    const handleSurgeonNameBlur = useCallback(
      () => onFieldBlur('surgeonName'),
      [onFieldBlur]
    );

    const handleProcedureNameBlur = useCallback(
      () => onFieldBlur('procedureName'),
      [onFieldBlur]
    );

    const handleGeneralNotesBlur = useCallback(
      () => onFieldBlur('generalNotes'),
      [onFieldBlur]
    );

    const handleSetupNotesBlur = useCallback(
      () => onFieldBlur('setupNotes'),
      [onFieldBlur]
    );

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Section */}
          <FormSection
            title="Basic Information"
            description="Enter the essential details for this preference card"
            icon="document-text-outline"
          >
            {/* Title - Required */}
            <FormInput
              label="Card Title"
              value={data.title}
              onChangeText={handleTitleChange}
              onBlur={handleTitleBlur}
              error={errors.title}
              required
              placeholder="e.g., Laparoscopic Cholecystectomy"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => surgeonNameRef.current?.focus()}
              editable={!isSubmitting}
              showCharCount
              maxLength={CARD_FORM_CONSTRAINTS.title.maxLength}
              clearable
            />

            {/* Surgeon Name */}
            <FormInput
              ref={surgeonNameRef}
              label="Surgeon Name"
              value={data.surgeonName}
              onChangeText={handleSurgeonNameChange}
              onBlur={handleSurgeonNameBlur}
              error={errors.surgeonName}
              placeholder="e.g., Dr. Smith"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => procedureNameRef.current?.focus()}
              editable={!isSubmitting}
              maxLength={CARD_FORM_CONSTRAINTS.surgeonName.maxLength}
              clearable
              helpText="Associate this card with a specific surgeon"
            />

            {/* Procedure Name */}
            <FormInput
              ref={procedureNameRef}
              label="Procedure Name"
              value={data.procedureName}
              onChangeText={handleProcedureNameChange}
              onBlur={handleProcedureNameBlur}
              error={errors.procedureName}
              placeholder="e.g., Lap Chole"
              autoCapitalize="words"
              returnKeyType="next"
              editable={!isSubmitting}
              maxLength={CARD_FORM_CONSTRAINTS.procedureName.maxLength}
              clearable
              helpText="Common name or abbreviation for the procedure"
            />

            {/* Specialty Picker */}
            <SpecialtyPicker
              value={data.specialty}
              onValueChange={handleSpecialtyChange}
              error={errors.specialty}
              disabled={isSubmitting}
            />
          </FormSection>

          {/* Notes Section */}
          <FormSection
            title="Notes"
            description="Add any important information for this setup"
            icon="create-outline"
          >
            {/* General Notes */}
            <FormTextArea
              ref={generalNotesRef}
              label="General Notes"
              value={data.generalNotes}
              onChangeText={handleGeneralNotesChange}
              onBlur={handleGeneralNotesBlur}
              error={errors.generalNotes}
              placeholder="General information about this preference card, surgeon preferences, special considerations..."
              editable={!isSubmitting}
              showCharCount
              maxLength={CARD_FORM_CONSTRAINTS.generalNotes.maxLength}
              minHeight={100}
              maxHeight={200}
              helpText="General information and surgeon preferences"
            />

            {/* Setup Notes */}
            <FormTextArea
              ref={setupNotesRef}
              label="Setup Notes"
              value={data.setupNotes}
              onChangeText={handleSetupNotesChange}
              onBlur={handleSetupNotesBlur}
              error={errors.setupNotes}
              placeholder="Room setup details, back table organization, mayo stand arrangement, special positioning requirements..."
              editable={!isSubmitting}
              showCharCount
              maxLength={CARD_FORM_CONSTRAINTS.setupNotes.maxLength}
              minHeight={100}
              maxHeight={200}
              helpText="Specific setup and preparation instructions"
            />
          </FormSection>

          {/* Placeholder for Items Section (Stage 5C) */}
          <View style={styles.placeholderSection}>
            <FormSection
              title="Items"
              description="Instruments, supplies, and equipment will be added in the next stage"
              icon="list-outline"
            >
              <View style={styles.placeholder}>
                {/* This will be replaced with ItemManagement component in Stage 5C */}
              </View>
            </FormSection>
          </View>

          {/* Placeholder for Photos Section (Stage 5D) */}
          <View style={styles.placeholderSection}>
            <FormSection
              title="Setup Photos"
              description="Photo uploads will be added in a future stage"
              icon="camera-outline"
            >
              <View style={styles.placeholder}>
                {/* This will be replaced with PhotoUploader component in Stage 5D */}
              </View>
            </FormSection>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

CardForm.displayName = 'CardForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  placeholderSection: {
    opacity: 0.5,
  },
  placeholder: {
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
});

export default CardForm;
