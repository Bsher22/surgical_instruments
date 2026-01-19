/**
 * Hook for checking and gating premium features
 */
import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import {
  useSubscriptionStore,
  useIsPremium,
} from '../stores/subscriptionStore';
import { useFeatureAccess } from '../api/subscriptions';
import { PremiumFeature } from '../types/subscription';
import { FEATURE_MESSAGES, FREE_TIER_LIMITS } from '../constants/subscription';

// ─────────────────────────────────────────────────────────────────────────────
// Feature Access Hook
// ─────────────────────────────────────────────────────────────────────────────

interface UsePremiumFeatureOptions {
  /** Whether to show upgrade prompt automatically when blocked */
  autoPrompt?: boolean;
  /** Whether to navigate to paywall when blocked */
  autoNavigate?: boolean;
  /** Custom message to show when blocked */
  customMessage?: string;
}

interface UsePremiumFeatureResult {
  /** Whether user has access to this feature */
  hasAccess: boolean;
  /** Whether the access check is loading */
  isLoading: boolean;
  /** Reason access was denied (if any) */
  reason: string | null;
  /** Function to check access and handle gating */
  checkAccess: () => boolean;
  /** Function to wrap an action with access check */
  withAccessCheck: <T>(action: () => T | Promise<T>) => Promise<T | undefined>;
}

export function usePremiumFeature(
  feature: PremiumFeature,
  options: UsePremiumFeatureOptions = {}
): UsePremiumFeatureResult {
  const { autoPrompt = true, autoNavigate = false, customMessage } = options;
  
  const router = useRouter();
  const isPremium = useIsPremium();
  const { status, triggerUpgradePrompt } = useSubscriptionStore();
  
  // Use React Query for server-side validation (optional)
  const {
    data: featureAccess,
    isLoading,
  } = useFeatureAccess(feature, {
    enabled: !isPremium, // Only check server if not premium
  });
  
  // Determine access based on local state (faster) or server response
  const hasAccess = useMemo(() => {
    // Premium users have access to everything
    if (isPremium) return true;
    
    // If we have server response, use it
    if (featureAccess) {
      return featureAccess.has_access;
    }
    
    // Fall back to local checks
    if (!status) return true; // Allow if status not loaded
    
    switch (feature) {
      case 'create_card':
      case 'unlimited_cards':
        if (status.cards_limit === null) return true;
        return status.cards_used < status.cards_limit;
      
      case 'take_quiz':
      case 'unlimited_quizzes':
        if (status.quizzes_limit === null) return true;
        return status.quizzes_today < status.quizzes_limit;
      
      case 'full_instrument_details':
        return FREE_TIER_LIMITS.showFullInstrumentDetails;
      
      case 'unlimited_flashcards':
      case 'ad_free':
        return false; // Premium only
      
      default:
        return true;
    }
  }, [isPremium, featureAccess, status, feature]);
  
  const reason = useMemo(() => {
    if (hasAccess) return null;
    if (featureAccess?.reason) return featureAccess.reason;
    return FEATURE_MESSAGES[feature]?.message || 'Premium subscription required';
  }, [hasAccess, featureAccess, feature]);
  
  // Check access and optionally show prompt
  const checkAccess = useCallback((): boolean => {
    if (hasAccess) return true;
    
    const featureInfo = FEATURE_MESSAGES[feature];
    const message = customMessage || featureInfo?.message || 'This feature requires Premium.';
    const title = featureInfo?.title || 'Premium Feature';
    
    if (autoNavigate) {
      Alert.alert(
        title,
        message,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => router.push('/(tabs)/profile/subscription'),
          },
        ]
      );
    } else if (autoPrompt) {
      triggerUpgradePrompt(feature);
    }
    
    return false;
  }, [hasAccess, feature, autoPrompt, autoNavigate, customMessage, triggerUpgradePrompt, router]);
  
  // Wrap an action with access check
  const withAccessCheck = useCallback(async <T,>(
    action: () => T | Promise<T>
  ): Promise<T | undefined> => {
    if (!checkAccess()) {
      return undefined;
    }
    return action();
  }, [checkAccess]);
  
  return {
    hasAccess,
    isLoading,
    reason,
    checkAccess,
    withAccessCheck,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Hooks for Specific Features
// ─────────────────────────────────────────────────────────────────────────────

export function useCanCreateCard(options?: UsePremiumFeatureOptions) {
  return usePremiumFeature('create_card', options);
}

export function useCanTakeQuiz(options?: UsePremiumFeatureOptions) {
  return usePremiumFeature('take_quiz', options);
}

export function useCanViewFullDetails(options?: UsePremiumFeatureOptions) {
  return usePremiumFeature('full_instrument_details', options);
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage Stats Hook
// ─────────────────────────────────────────────────────────────────────────────

interface UsageInfo {
  current: number;
  limit: number | null;
  remaining: number | null;
  percentUsed: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  displayText: string;
}

export function useUsageStats(): {
  cards: UsageInfo;
  quizzes: UsageInfo;
} {
  const { status } = useSubscriptionStore();
  const isPremium = useIsPremium();
  
  const createUsageInfo = (
    current: number,
    limit: number | null
  ): UsageInfo => {
    const remaining = limit !== null ? Math.max(0, limit - current) : null;
    const percentUsed = limit !== null ? Math.min(100, (current / limit) * 100) : 0;
    const isNearLimit = limit !== null && percentUsed >= 80;
    const isAtLimit = limit !== null && current >= limit;
    
    let displayText: string;
    if (limit === null) {
      displayText = 'Unlimited';
    } else if (isAtLimit) {
      displayText = `${limit}/${limit} (Limit reached)`;
    } else {
      displayText = `${current}/${limit}`;
    }
    
    return {
      current,
      limit,
      remaining,
      percentUsed,
      isNearLimit,
      isAtLimit,
      displayText,
    };
  };
  
  return useMemo(() => ({
    cards: createUsageInfo(
      status?.cards_used || 0,
      isPremium ? null : status?.cards_limit ?? FREE_TIER_LIMITS.maxCards
    ),
    quizzes: createUsageInfo(
      status?.quizzes_today || 0,
      isPremium ? null : status?.quizzes_limit ?? FREE_TIER_LIMITS.dailyQuizzes
    ),
  }), [status, isPremium]);
}

export default usePremiumFeature;
