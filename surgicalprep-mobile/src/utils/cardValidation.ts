// src/utils/cardValidation.ts
// Form validation logic for preference cards

import {
  CardFormData,
  CardFormErrors,
  CARD_FORM_CONSTRAINTS,
} from '../types/cardForm';
import { isValidSpecialty } from './specialties';

/**
 * Validate the entire card form
 * @returns Object with field-specific error messages, empty if valid
 */
export function validateCardForm(data: CardFormData): CardFormErrors {
  const errors: CardFormErrors = {};

  // Title validation (required)
  const titleError = validateTitle(data.title);
  if (titleError) {
    errors.title = titleError;
  }

  // Surgeon name validation (optional but has constraints)
  const surgeonNameError = validateSurgeonName(data.surgeonName);
  if (surgeonNameError) {
    errors.surgeonName = surgeonNameError;
  }

  // Procedure name validation (optional but has constraints)
  const procedureNameError = validateProcedureName(data.procedureName);
  if (procedureNameError) {
    errors.procedureName = procedureNameError;
  }

  // Specialty validation (optional but must be valid if provided)
  const specialtyError = validateSpecialty(data.specialty);
  if (specialtyError) {
    errors.specialty = specialtyError;
  }

  // General notes validation
  const generalNotesError = validateGeneralNotes(data.generalNotes);
  if (generalNotesError) {
    errors.generalNotes = generalNotesError;
  }

  // Setup notes validation
  const setupNotesError = validateSetupNotes(data.setupNotes);
  if (setupNotesError) {
    errors.setupNotes = setupNotesError;
  }

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: CardFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Validate a single field
 */
export function validateField(
  field: keyof CardFormData,
  value: string
): string | undefined {
  switch (field) {
    case 'title':
      return validateTitle(value);
    case 'surgeonName':
      return validateSurgeonName(value);
    case 'procedureName':
      return validateProcedureName(value);
    case 'specialty':
      return validateSpecialty(value);
    case 'generalNotes':
      return validateGeneralNotes(value);
    case 'setupNotes':
      return validateSetupNotes(value);
    default:
      return undefined;
  }
}

// Individual field validators

function validateTitle(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Title is required';
  }

  if (trimmed.length < CARD_FORM_CONSTRAINTS.title.minLength) {
    return `Title must be at least ${CARD_FORM_CONSTRAINTS.title.minLength} characters`;
  }

  if (trimmed.length > CARD_FORM_CONSTRAINTS.title.maxLength) {
    return `Title must be ${CARD_FORM_CONSTRAINTS.title.maxLength} characters or less`;
  }

  return undefined;
}

function validateSurgeonName(value: string): string | undefined {
  if (!value) return undefined; // Optional field

  if (value.length > CARD_FORM_CONSTRAINTS.surgeonName.maxLength) {
    return `Surgeon name must be ${CARD_FORM_CONSTRAINTS.surgeonName.maxLength} characters or less`;
  }

  return undefined;
}

function validateProcedureName(value: string): string | undefined {
  if (!value) return undefined; // Optional field

  if (value.length > CARD_FORM_CONSTRAINTS.procedureName.maxLength) {
    return `Procedure name must be ${CARD_FORM_CONSTRAINTS.procedureName.maxLength} characters or less`;
  }

  return undefined;
}

function validateSpecialty(value: string): string | undefined {
  if (!value) return undefined; // Optional field

  if (!isValidSpecialty(value)) {
    return 'Please select a valid specialty';
  }

  return undefined;
}

function validateGeneralNotes(value: string): string | undefined {
  if (!value) return undefined; // Optional field

  if (value.length > CARD_FORM_CONSTRAINTS.generalNotes.maxLength) {
    return `General notes must be ${CARD_FORM_CONSTRAINTS.generalNotes.maxLength} characters or less`;
  }

  return undefined;
}

function validateSetupNotes(value: string): string | undefined {
  if (!value) return undefined; // Optional field

  if (value.length > CARD_FORM_CONSTRAINTS.setupNotes.maxLength) {
    return `Setup notes must be ${CARD_FORM_CONSTRAINTS.setupNotes.maxLength} characters or less`;
  }

  return undefined;
}

/**
 * Sanitize form data before submission
 * Trims whitespace and normalizes empty strings
 */
export function sanitizeCardFormData(data: CardFormData): CardFormData {
  return {
    title: data.title.trim(),
    surgeonName: data.surgeonName.trim(),
    procedureName: data.procedureName.trim(),
    specialty: data.specialty,
    generalNotes: data.generalNotes.trim(),
    setupNotes: data.setupNotes.trim(),
  };
}
