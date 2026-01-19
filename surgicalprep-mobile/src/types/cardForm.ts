// src/types/cardForm.ts
// Form-specific types for preference card create/edit

export interface CardFormData {
  title: string;
  surgeonName: string;
  procedureName: string;
  specialty: string;
  generalNotes: string;
  setupNotes: string;
}

export interface CardFormErrors {
  title?: string;
  surgeonName?: string;
  procedureName?: string;
  specialty?: string;
  generalNotes?: string;
  setupNotes?: string;
}

export interface CardFormState {
  data: CardFormData;
  errors: CardFormErrors;
  isDirty: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
}

export const initialCardFormData: CardFormData = {
  title: '',
  surgeonName: '',
  procedureName: '',
  specialty: '',
  generalNotes: '',
  setupNotes: '',
};

export const initialCardFormErrors: CardFormErrors = {};

export const initialCardFormState: CardFormState = {
  data: initialCardFormData,
  errors: initialCardFormErrors,
  isDirty: false,
  isSubmitting: false,
  isLoading: false,
};

// Validation constraints
export const CARD_FORM_CONSTRAINTS = {
  title: {
    minLength: 3,
    maxLength: 100,
  },
  surgeonName: {
    maxLength: 100,
  },
  procedureName: {
    maxLength: 150,
  },
  generalNotes: {
    maxLength: 2000,
  },
  setupNotes: {
    maxLength: 2000,
  },
} as const;
