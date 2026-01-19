/**
 * Subscription-related TypeScript types
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums and Constants
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
export type SubscriptionPlan = 'monthly' | 'annual';
export type BillingInterval = 'month' | 'year';

export type PremiumFeature =
  | 'unlimited_cards'
  | 'unlimited_quizzes'
  | 'unlimited_flashcards'
  | 'full_instrument_details'
  | 'ad_free'
  | 'create_card'
  | 'take_quiz';

// ─────────────────────────────────────────────────────────────────────────────
// API Request Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCheckoutSessionRequest {
  plan: SubscriptionPlan;
  success_url?: string;
  cancel_url?: string;
}

export interface CreatePortalSessionRequest {
  return_url?: string;
}

export interface RestorePurchasesRequest {
  email?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface PortalSessionResponse {
  portal_url: string;
}

export interface SubscriptionStatusResponse {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  expires_at: string | null;
  is_active: boolean;
  can_access_premium: boolean;
  cards_used: number;
  cards_limit: number | null;
  quizzes_today: number;
  quizzes_limit: number | null;
}

export interface SubscriptionPlanInfo {
  id: SubscriptionPlan;
  name: string;
  price: number;
  interval: BillingInterval;
  price_id: string;
  description: string;
  savings_percent: number | null;
}

export interface AvailablePlansResponse {
  plans: SubscriptionPlanInfo[];
}

export interface FeatureAccessResponse {
  has_access: boolean;
  feature: string;
  reason: string | null;
  upgrade_url: string | null;
}

export interface RestorePurchasesResponse {
  found: boolean;
  message: string;
  subscription_status: SubscriptionStatusResponse | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PremiumRequiredError {
  code: 'PREMIUM_REQUIRED';
  message: string;
  feature: string;
  upgrade_url: string;
}

export interface SubscriptionError {
  detail: string | PremiumRequiredError;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PremiumBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface UsageLimits {
  maxCards: number | null;
  dailyQuizzes: number | null;
  dailyFlashcards: number | null;
  showFullInstrumentDetails: boolean;
}

export interface UsageStats {
  cardsUsed: number;
  cardsLimit: number | null;
  quizzesToday: number;
  quizzesLimit: number | null;
  flashcardsToday: number;
  flashcardsLimit: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SubscriptionState {
  // Status
  status: SubscriptionStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Plans
  availablePlans: SubscriptionPlanInfo[];
  selectedPlan: SubscriptionPlan;
  
  // UI State
  showUpgradePrompt: boolean;
  upgradePromptFeature: PremiumFeature | null;
  
  // Actions
  fetchStatus: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  setSelectedPlan: (plan: SubscriptionPlan) => void;
  triggerUpgradePrompt: (feature: PremiumFeature) => void;
  dismissUpgradePrompt: () => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isPremiumRequiredError(error: unknown): error is { detail: PremiumRequiredError } {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as Record<string, unknown>;
  if (typeof err.detail !== 'object' || err.detail === null) return false;
  const detail = err.detail as Record<string, unknown>;
  return detail.code === 'PREMIUM_REQUIRED';
}

export function isSubscriptionActive(status: SubscriptionStatusResponse | null): boolean {
  if (!status) return false;
  return status.is_active && status.can_access_premium;
}

export function hasReachedLimit(
  current: number,
  limit: number | null
): boolean {
  if (limit === null) return false;
  return current >= limit;
}
