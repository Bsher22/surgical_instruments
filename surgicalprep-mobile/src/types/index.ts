// src/types/index.ts
// Main types file - includes types from backend schemas

// Re-export card form types
export * from './cardForm';

// ============================================
// Preference Card Types (matching backend schemas)
// ============================================

export interface PreferenceCard {
  id: string;
  user_id: string;
  title: string;
  surgeon_name?: string;
  procedure_name?: string;
  specialty?: string;
  general_notes?: string;
  setup_notes?: string;
  is_template: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items?: PreferenceCardItem[];
  photos?: CardPhoto[];
}

export interface PreferenceCardItem {
  id: string;
  card_id: string;
  instrument_id?: string;
  custom_name?: string;
  quantity: number;
  size?: string;
  notes?: string;
  category: CardItemCategory;
  sort_order: number;
  instrument?: Instrument;
}

export type CardItemCategory =
  | 'instruments'
  | 'supplies'
  | 'sutures'
  | 'implants'
  | 'medications'
  | 'equipment'
  | 'other';

export interface CardPhoto {
  id: string;
  card_id: string;
  url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateCardRequest {
  title: string;
  surgeon_name?: string;
  procedure_name?: string;
  specialty?: string;
  general_notes?: string;
  setup_notes?: string;
}

export interface UpdateCardRequest {
  title?: string;
  surgeon_name?: string;
  procedure_name?: string;
  specialty?: string;
  general_notes?: string;
  setup_notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CardsListParams {
  page?: number;
  per_page?: number;
  search?: string;
  specialty?: string;
  sort_by?: 'title' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// ============================================
// Instrument Types (from Stage 3)
// ============================================

export interface Instrument {
  id: string;
  name: string;
  aliases?: string[];
  category: InstrumentCategory;
  description?: string;
  primary_uses?: string[];
  common_procedures?: string[];
  handling_notes?: string;
  image_url?: string;
  thumbnail_url?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export type InstrumentCategory =
  | 'cutting'
  | 'grasping'
  | 'clamping'
  | 'retracting'
  | 'probing'
  | 'suctioning'
  | 'suturing'
  | 'specialty'
  | 'other';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'surgical_tech_student'
  | 'certified_surgical_tech'
  | 'or_nurse'
  | 'surgical_tech_educator'
  | 'other';

export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'surgical_tech_student',
    label: 'Surgical Tech Student',
    description: 'Currently enrolled in a surgical technology program',
  },
  {
    value: 'certified_surgical_tech',
    label: 'Certified Surgical Tech',
    description: 'CST or equivalent certification',
  },
  {
    value: 'or_nurse',
    label: 'OR Nurse',
    description: 'Registered nurse working in the operating room',
  },
  {
    value: 'surgical_tech_educator',
    label: 'Surgical Tech Educator',
    description: 'Instructor or professor in surgical technology',
  },
  {
    value: 'other',
    label: 'Other Healthcare Professional',
    description: 'Other surgical or healthcare role',
  },
];

export type SubscriptionTier = 'free' | 'premium';

// ============================================
// Auth Types
// ============================================

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  institution?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = error.status;
    this.detail = error.detail;
    this.errors = error.errors;
  }
}
