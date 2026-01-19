/**
 * Subscription constants and configuration
 */
import { PremiumBenefit, UsageLimits, PremiumFeature } from '../types/subscription';

// ─────────────────────────────────────────────────────────────────────────────
// Tier Limits
// ─────────────────────────────────────────────────────────────────────────────

export const FREE_TIER_LIMITS: UsageLimits = {
  maxCards: 5,
  dailyQuizzes: 3,
  dailyFlashcards: 10,
  showFullInstrumentDetails: false,
};

export const PREMIUM_TIER_LIMITS: UsageLimits = {
  maxCards: null, // Unlimited
  dailyQuizzes: null, // Unlimited
  dailyFlashcards: null, // Unlimited
  showFullInstrumentDetails: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Premium Benefits
// ─────────────────────────────────────────────────────────────────────────────

export const PREMIUM_BENEFITS: PremiumBenefit[] = [
  {
    id: 'unlimited_cards',
    icon: 'layers',
    title: 'Unlimited Preference Cards',
    description: 'Create as many preference cards as you need for any procedure',
  },
  {
    id: 'unlimited_quizzes',
    icon: 'brain',
    title: 'Unlimited Daily Quizzes',
    description: 'Study without limits - take as many quizzes as you want',
  },
  {
    id: 'unlimited_flashcards',
    icon: 'repeat',
    title: 'Unlimited Flashcard Sessions',
    description: 'Review instruments with unlimited flashcard practice',
  },
  {
    id: 'full_instrument_details',
    icon: 'file-text',
    title: 'Full Instrument Details',
    description: 'Access complete information including handling notes and procedures',
  },
  {
    id: 'ad_free',
    icon: 'ban',
    title: 'Ad-Free Experience',
    description: 'Study without distractions or interruptions',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────────────

export const PRICING = {
  monthly: {
    price: 4.99,
    interval: 'month' as const,
    perMonthPrice: 4.99,
    displayPrice: '$4.99/month',
  },
  annual: {
    price: 29.99,
    interval: 'year' as const,
    perMonthPrice: 2.50,
    displayPrice: '$29.99/year',
    savingsPercent: 50,
    savingsAmount: 29.89, // 4.99 * 12 - 29.99
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Feature to Benefit Mapping
// ─────────────────────────────────────────────────────────────────────────────

export const FEATURE_MESSAGES: Record<PremiumFeature, { title: string; message: string }> = {
  unlimited_cards: {
    title: 'Card Limit Reached',
    message: `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxCards} preference cards. Upgrade to Premium for unlimited cards.`,
  },
  unlimited_quizzes: {
    title: 'Daily Quiz Limit',
    message: `You've used all ${FREE_TIER_LIMITS.dailyQuizzes} free quizzes for today. Upgrade to Premium for unlimited quizzes.`,
  },
  unlimited_flashcards: {
    title: 'Flashcard Limit',
    message: `You've used all ${FREE_TIER_LIMITS.dailyFlashcards} free flashcard sessions for today. Upgrade for unlimited practice.`,
  },
  full_instrument_details: {
    title: 'Premium Content',
    message: 'Full instrument details including handling notes are available with Premium.',
  },
  ad_free: {
    title: 'Remove Ads',
    message: 'Upgrade to Premium for an ad-free study experience.',
  },
  create_card: {
    title: 'Card Limit Reached',
    message: `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxCards} preference cards. Upgrade to create more.`,
  },
  take_quiz: {
    title: 'Daily Quiz Limit',
    message: `You've used all ${FREE_TIER_LIMITS.dailyQuizzes} free quizzes for today. Come back tomorrow or upgrade!`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// URLs
// ─────────────────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_URLS = {
  termsOfService: 'https://surgicalprep.app/terms',
  privacyPolicy: 'https://surgicalprep.app/privacy',
  support: 'https://surgicalprep.app/support',
};

// ─────────────────────────────────────────────────────────────────────────────
// Deep Links
// ─────────────────────────────────────────────────────────────────────────────

export const DEEP_LINKS = {
  subscriptionSuccess: 'surgicalprep://subscription/success',
  subscriptionCancel: 'surgicalprep://subscription/cancel',
  subscriptionReturn: 'surgicalprep://subscription',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get limits for a given tier
 */
export function getLimitsForTier(tier: 'free' | 'premium'): UsageLimits {
  return tier === 'premium' ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, interval: 'month' | 'year'): string {
  const formatted = price.toFixed(2);
  return interval === 'month' ? `$${formatted}/mo` : `$${formatted}/yr`;
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(monthlyPrice: number, annualPrice: number): number {
  const yearlyAtMonthlyRate = monthlyPrice * 12;
  const savings = ((yearlyAtMonthlyRate - annualPrice) / yearlyAtMonthlyRate) * 100;
  return Math.round(savings);
}

/**
 * Get usage display text
 */
export function getUsageDisplay(current: number, limit: number | null): string {
  if (limit === null) {
    return 'Unlimited';
  }
  return `${current}/${limit}`;
}

/**
 * Check if near limit (80% or more)
 */
export function isNearLimit(current: number, limit: number | null): boolean {
  if (limit === null) return false;
  return current >= limit * 0.8;
}
