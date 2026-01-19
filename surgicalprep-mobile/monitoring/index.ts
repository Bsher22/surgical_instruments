// src/services/index.ts
// Barrel exports for monitoring and analytics services

// Analytics
export {
  analytics,
  initializeAnalytics,
  disableAnalytics,
  setUserId,
  setUserProperties,
  logEvent,
  logScreenView,
} from './analytics';

// Analytics Events
export {
  AnalyticsEvents,
  trackAuth,
  trackInstrument,
  trackCard,
  trackQuiz,
  trackFlashcard,
  trackSubscription,
  trackEngagement,
  trackError,
} from './analyticsEvents';

export type {
  AuthEventParams,
  InstrumentEventParams,
  CardEventParams,
  QuizEventParams,
  SubscriptionEventParams,
  NavigationEventParams,
  ErrorEventParams,
  EngagementEventParams,
} from './analyticsEvents';

// Sentry Error Monitoring
export {
  sentry,
  initializeSentry,
  setUser,
  setContext,
  setTag,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  withErrorBoundary,
  wrap,
  Sentry,
} from './sentry';

export type { SeverityLevel } from './sentry';
