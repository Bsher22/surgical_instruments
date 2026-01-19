// src/hooks/useAnalytics.ts
// Custom hook for analytics integration

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePathname, useSegments } from 'expo-router';

import { analytics, logScreenView, setUserProperties } from '../services/analytics';
import {
  trackAuth,
  trackInstrument,
  trackCard,
  trackQuiz,
  trackFlashcard,
  trackSubscription,
  trackEngagement,
  InstrumentEventParams,
  CardEventParams,
  QuizEventParams,
  SubscriptionEventParams,
} from '../services/analyticsEvents';
import { sentry } from '../services/sentry';

/**
 * Initialize analytics and error monitoring
 * Call this once at app startup
 */
export const useAnalyticsInit = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize services
    analytics.initialize();
    sentry.initialize();

    // Track app open
    trackEngagement.appOpen();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came to foreground
          trackEngagement.appOpen();
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          // App went to background
          trackEngagement.appBackground();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
};

/**
 * Automatically track screen views based on navigation
 */
export const useScreenTracking = () => {
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // Convert pathname to screen name
    const screenName = pathname === '/' ? 'Home' : pathname.replace(/\//g, '_');
    
    // Log screen view
    logScreenView(screenName);
    
    // Add breadcrumb for error tracking
    sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${screenName}`,
      level: 'info',
      data: { pathname, segments },
    });
  }, [pathname, segments]);
};

/**
 * Set user identity for analytics and error tracking
 */
export const useUserIdentity = (user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  subscription_tier?: 'free' | 'premium';
  institution?: string;
} | null) => {
  useEffect(() => {
    if (user) {
      // Set analytics user ID
      analytics.setUserId(user.id);
      
      // Set user properties for segmentation
      setUserProperties({
        subscription_tier: user.subscription_tier,
        user_role: user.role,
        institution: user.institution,
      });
      
      // Set Sentry user for error tracking
      sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
        subscription_tier: user.subscription_tier,
      });
    } else {
      // Clear user identity on logout
      analytics.setUserId(null);
      sentry.setUser(null);
    }
  }, [user?.id, user?.subscription_tier]);
};

/**
 * Hook for instrument-related analytics
 */
export const useInstrumentAnalytics = () => {
  const trackView = useCallback((params: InstrumentEventParams) => {
    trackInstrument.view(params);
    sentry.addBreadcrumb({
      category: 'instrument',
      message: `Viewed instrument: ${params.instrument_name}`,
      data: params,
    });
  }, []);

  const trackSearch = useCallback((query: string, resultCount: number) => {
    trackInstrument.search({
      search_query: query,
      result_count: resultCount,
    });
  }, []);

  const trackFilter = useCallback((category: string) => {
    trackInstrument.filter({ filter_category: category });
  }, []);

  const trackBookmark = useCallback((params: InstrumentEventParams) => {
    trackInstrument.bookmark(params);
  }, []);

  const trackUnbookmark = useCallback((params: InstrumentEventParams) => {
    trackInstrument.unbookmark(params);
  }, []);

  return {
    trackView,
    trackSearch,
    trackFilter,
    trackBookmark,
    trackUnbookmark,
  };
};

/**
 * Hook for preference card analytics
 */
export const useCardAnalytics = () => {
  const trackView = useCallback((params: CardEventParams) => {
    trackCard.view(params);
    sentry.addBreadcrumb({
      category: 'card',
      message: `Viewed card: ${params.card_title}`,
      data: params,
    });
  }, []);

  const trackCreate = useCallback((params: CardEventParams) => {
    trackCard.create(params);
    sentry.addBreadcrumb({
      category: 'card',
      message: `Created card: ${params.card_title}`,
      data: params,
    });
  }, []);

  const trackEdit = useCallback((params: CardEventParams) => {
    trackCard.edit(params);
  }, []);

  const trackDelete = useCallback((params: CardEventParams) => {
    trackCard.delete(params);
    sentry.addBreadcrumb({
      category: 'card',
      message: `Deleted card: ${params.card_title}`,
      data: params,
    });
  }, []);

  const trackDuplicate = useCallback((params: CardEventParams) => {
    trackCard.duplicate(params);
  }, []);

  return {
    trackView,
    trackCreate,
    trackEdit,
    trackDelete,
    trackDuplicate,
  };
};

/**
 * Hook for quiz/study analytics
 */
export const useQuizAnalytics = () => {
  const sessionStartTime = useRef<number | null>(null);

  const trackStart = useCallback((params: QuizEventParams) => {
    sessionStartTime.current = Date.now();
    trackQuiz.start(params);
    sentry.addBreadcrumb({
      category: 'quiz',
      message: `Started quiz: ${params.quiz_type}`,
      data: params,
    });
  }, []);

  const trackComplete = useCallback((params: Omit<QuizEventParams, 'duration_seconds'>) => {
    const duration = sessionStartTime.current
      ? Math.round((Date.now() - sessionStartTime.current) / 1000)
      : undefined;
    
    trackQuiz.complete({
      ...params,
      duration_seconds: duration,
    });
    
    sentry.addBreadcrumb({
      category: 'quiz',
      message: `Completed quiz with score: ${params.score_percentage}%`,
      data: { ...params, duration_seconds: duration },
    });
    
    sessionStartTime.current = null;
  }, []);

  const trackAbandon = useCallback((params: QuizEventParams) => {
    trackQuiz.abandon(params);
    sessionStartTime.current = null;
  }, []);

  const trackAnswer = useCallback((correct: boolean, params: QuizEventParams) => {
    if (correct) {
      trackQuiz.answerCorrect(params);
    } else {
      trackQuiz.answerIncorrect(params);
    }
  }, []);

  return {
    trackStart,
    trackComplete,
    trackAbandon,
    trackAnswer,
  };
};

/**
 * Hook for subscription analytics
 */
export const useSubscriptionAnalytics = () => {
  const trackPaywallView = useCallback((source?: string) => {
    trackSubscription.viewPaywall({ source } as SubscriptionEventParams);
  }, []);

  const trackCheckoutStart = useCallback((params: SubscriptionEventParams) => {
    trackSubscription.startCheckout(params);
    sentry.addBreadcrumb({
      category: 'subscription',
      message: `Started checkout: ${params.plan}`,
      data: params,
    });
  }, []);

  const trackPurchaseComplete = useCallback((params: SubscriptionEventParams) => {
    trackSubscription.complete(params);
    sentry.addBreadcrumb({
      category: 'subscription',
      message: `Completed purchase: ${params.plan}`,
      data: params,
    });
  }, []);

  const trackFreeLimitHit = useCallback((
    limitType: 'cards' | 'quizzes',
    currentCount: number,
    limit: number
  ) => {
    trackSubscription.freeLimitHit({
      limit_type: limitType,
      current_count: currentCount,
      limit,
    });
  }, []);

  return {
    trackPaywallView,
    trackCheckoutStart,
    trackPurchaseComplete,
    trackFreeLimitHit,
  };
};

/**
 * Export all tracking functions for direct use
 */
export {
  trackAuth,
  trackInstrument,
  trackCard,
  trackQuiz,
  trackFlashcard,
  trackSubscription,
  trackEngagement,
};
