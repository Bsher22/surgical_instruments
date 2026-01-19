// src/types/user.ts
// User profile, settings, and account-related types

// =============================================================================
// Enums and Constants
// =============================================================================

export const USER_ROLES = {
  student: 'Student',
  surgical_tech: 'Surgical Tech',
  rn: 'Registered Nurse',
  cst: 'Certified Surgical Tech',
  crnfa: 'Certified RN First Assistant',
  other: 'Other',
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const SUBSCRIPTION_TIERS = {
  free: 'Free',
  premium: 'Premium',
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const DARK_MODE_OPTIONS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const;

export type DarkModeOption = keyof typeof DARK_MODE_OPTIONS;

export const TEXT_SIZE_OPTIONS = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
} as const;

export type TextSizeOption = keyof typeof TEXT_SIZE_OPTIONS;

// =============================================================================
// User Profile Types
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution?: string | null;
  avatar_url?: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string | null;
  subscription_cancelled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  role?: UserRole;
  institution?: string | null;
}

export interface UpdateProfileResponse {
  user: UserProfile;
  message: string;
}

// =============================================================================
// User Statistics Types
// =============================================================================

export interface UserStats {
  cards_created: number;
  cards_limit: number | null; // null = unlimited (premium)
  instruments_studied: number;
  instruments_total: number;
  quizzes_completed: number;
  flashcard_sessions_completed: number;
  average_quiz_score: number | null;
  current_streak: number;
  longest_streak: number;
  total_study_time_minutes: number;
  last_study_date: string | null;
  instruments_due_for_review: number;
}

// =============================================================================
// User Settings Types
// =============================================================================

export interface UserSettings {
  // Quiz preferences
  quiz_question_count: number;
  quiz_timer_enabled: boolean;
  quiz_timer_seconds: number;
  preferred_categories: string[];
  
  // Display preferences
  dark_mode: DarkModeOption;
  text_size: TextSizeOption;
  haptic_feedback_enabled: boolean;
  
  // Notification preferences (for future use)
  study_reminders_enabled: boolean;
  reminder_time?: string; // HH:mm format
}

export interface UpdateSettingsRequest {
  quiz_question_count?: number;
  quiz_timer_enabled?: boolean;
  quiz_timer_seconds?: number;
  preferred_categories?: string[];
  dark_mode?: DarkModeOption;
  text_size?: TextSizeOption;
  haptic_feedback_enabled?: boolean;
  study_reminders_enabled?: boolean;
  reminder_time?: string;
}

// Default settings values
export const DEFAULT_USER_SETTINGS: UserSettings = {
  quiz_question_count: 20,
  quiz_timer_enabled: false,
  quiz_timer_seconds: 30,
  preferred_categories: [],
  dark_mode: 'system',
  text_size: 'medium',
  haptic_feedback_enabled: true,
  study_reminders_enabled: false,
  reminder_time: undefined,
};

// =============================================================================
// Authentication & Account Types
// =============================================================================

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // Must be "DELETE"
}

export interface DeleteAccountResponse {
  message: string;
}

// =============================================================================
// Subscription Types
// =============================================================================

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  is_active: boolean;
  expires_at?: string | null;
  cancelled?: boolean;
  will_renew: boolean;
  days_remaining?: number;
}

export interface SubscriptionLimits {
  cards_limit: number | null;
  quizzes_per_day: number | null;
  flashcards_per_day: number | null;
  full_instrument_details: boolean;
}

export const FREE_TIER_LIMITS: SubscriptionLimits = {
  cards_limit: 5,
  quizzes_per_day: 3,
  flashcards_per_day: 20,
  full_instrument_details: false,
};

export const PREMIUM_TIER_LIMITS: SubscriptionLimits = {
  cards_limit: null, // unlimited
  quizzes_per_day: null, // unlimited
  flashcards_per_day: null, // unlimited
  full_instrument_details: true,
};

// =============================================================================
// Helper Functions
// =============================================================================

export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    student: '#6366F1', // indigo
    surgical_tech: '#10B981', // emerald
    rn: '#3B82F6', // blue
    cst: '#8B5CF6', // violet
    crnfa: '#EC4899', // pink
    other: '#6B7280', // gray
  };
  return colors[role] || colors.other;
};

export const getSubscriptionBadgeColor = (tier: SubscriptionTier): string => {
  return tier === 'premium' ? '#F59E0B' : '#6B7280'; // amber for premium, gray for free
};

export const formatSubscriptionExpiry = (expiresAt: string | null | undefined): string => {
  if (!expiresAt) return 'No expiration';
  
  const date = new Date(expiresAt);
  const now = new Date();
  const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) return 'Expired';
  if (daysRemaining === 0) return 'Expires today';
  if (daysRemaining === 1) return 'Expires tomorrow';
  if (daysRemaining <= 7) return `Expires in ${daysRemaining} days`;
  
  return `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getLimitsForTier = (tier: SubscriptionTier): SubscriptionLimits => {
  return tier === 'premium' ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
};
