// src/services/analyticsEvents.ts
// Analytics event constants and type definitions

/**
 * Analytics Event Names
 * Use these constants for consistent event naming across the app
 */
export const AnalyticsEvents = {
  // Authentication Events
  AUTH: {
    SIGN_UP: 'sign_up',
    LOGIN: 'login',
    LOGOUT: 'logout',
    PASSWORD_RESET: 'password_reset',
    ACCOUNT_DELETED: 'account_deleted',
  },

  // Instrument Events
  INSTRUMENT: {
    VIEW: 'instrument_view',
    SEARCH: 'instrument_search',
    FILTER: 'instrument_filter',
    BOOKMARK: 'instrument_bookmark',
    UNBOOKMARK: 'instrument_unbookmark',
  },

  // Preference Card Events
  CARD: {
    VIEW: 'card_view',
    CREATE: 'card_create',
    EDIT: 'card_edit',
    DELETE: 'card_delete',
    DUPLICATE: 'card_duplicate',
    ADD_ITEM: 'card_add_item',
    REMOVE_ITEM: 'card_remove_item',
    ADD_PHOTO: 'card_add_photo',
    SHARE: 'card_share',
  },

  // Quiz Events
  QUIZ: {
    START: 'quiz_start',
    COMPLETE: 'quiz_complete',
    ABANDON: 'quiz_abandon',
    ANSWER_CORRECT: 'quiz_answer_correct',
    ANSWER_INCORRECT: 'quiz_answer_incorrect',
    REVIEW_MISTAKES: 'quiz_review_mistakes',
  },

  // Flashcard Events
  FLASHCARD: {
    SESSION_START: 'flashcard_session_start',
    SESSION_COMPLETE: 'flashcard_session_complete',
    SWIPE_RIGHT: 'flashcard_swipe_right', // Got it
    SWIPE_LEFT: 'flashcard_swipe_left', // Study more
    FLIP: 'flashcard_flip',
  },

  // Subscription Events
  SUBSCRIPTION: {
    VIEW_PAYWALL: 'subscription_view_paywall',
    START_CHECKOUT: 'subscription_start_checkout',
    COMPLETE: 'subscription_complete',
    CANCEL: 'subscription_cancel',
    RESTORE: 'subscription_restore',
    FREE_LIMIT_HIT: 'subscription_free_limit_hit',
  },

  // Navigation Events
  NAVIGATION: {
    TAB_CHANGE: 'tab_change',
    SCREEN_VIEW: 'screen_view',
  },

  // Error Events
  ERROR: {
    API_ERROR: 'error_api',
    NETWORK_ERROR: 'error_network',
    CRASH: 'error_crash',
  },

  // Engagement Events
  ENGAGEMENT: {
    APP_OPEN: 'app_open',
    APP_BACKGROUND: 'app_background',
    NOTIFICATION_RECEIVED: 'notification_received',
    NOTIFICATION_OPENED: 'notification_opened',
    SHARE: 'share',
    RATE_APP: 'rate_app',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
  },
} as const;

/**
 * Analytics Event Parameter Types
 */
export interface AuthEventParams {
  method?: 'email' | 'google' | 'apple';
  success?: boolean;
}

export interface InstrumentEventParams {
  instrument_id?: string;
  instrument_name?: string;
  category?: string;
  search_query?: string;
  filter_category?: string;
  result_count?: number;
}

export interface CardEventParams {
  card_id?: string;
  card_title?: string;
  specialty?: string;
  procedure?: string;
  item_count?: number;
  photo_count?: number;
  is_template?: boolean;
}

export interface QuizEventParams {
  quiz_type?: 'multiple_choice' | 'flashcard';
  category?: string;
  question_count?: number;
  correct_count?: number;
  incorrect_count?: number;
  score_percentage?: number;
  duration_seconds?: number;
  question_id?: string;
  is_review?: boolean;
}

export interface SubscriptionEventParams {
  plan?: 'monthly' | 'annual';
  price?: number;
  currency?: string;
  source?: string;
  limit_type?: 'cards' | 'quizzes';
  current_count?: number;
  limit?: number;
}

export interface NavigationEventParams {
  screen_name?: string;
  previous_screen?: string;
  tab_name?: string;
}

export interface ErrorEventParams {
  error_type?: string;
  error_message?: string;
  error_code?: string | number;
  endpoint?: string;
  stack_trace?: string;
}

export interface EngagementEventParams {
  source?: string;
  notification_type?: string;
  content_type?: string;
  content_id?: string;
}

/**
 * Type-safe event logging helpers
 */
import { logEvent } from './analytics';

export const trackAuth = {
  signUp: (params?: AuthEventParams) =>
    logEvent(AnalyticsEvents.AUTH.SIGN_UP, params),
  login: (params?: AuthEventParams) =>
    logEvent(AnalyticsEvents.AUTH.LOGIN, params),
  logout: () =>
    logEvent(AnalyticsEvents.AUTH.LOGOUT),
  passwordReset: () =>
    logEvent(AnalyticsEvents.AUTH.PASSWORD_RESET),
  accountDeleted: () =>
    logEvent(AnalyticsEvents.AUTH.ACCOUNT_DELETED),
};

export const trackInstrument = {
  view: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.INSTRUMENT.VIEW, params),
  search: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.INSTRUMENT.SEARCH, params),
  filter: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.INSTRUMENT.FILTER, params),
  bookmark: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.INSTRUMENT.BOOKMARK, params),
  unbookmark: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.INSTRUMENT.UNBOOKMARK, params),
};

export const trackCard = {
  view: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.VIEW, params),
  create: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.CREATE, params),
  edit: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.EDIT, params),
  delete: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.DELETE, params),
  duplicate: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.DUPLICATE, params),
  addItem: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.ADD_ITEM, params),
  removeItem: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.REMOVE_ITEM, params),
  addPhoto: (params: CardEventParams) =>
    logEvent(AnalyticsEvents.CARD.ADD_PHOTO, params),
};

export const trackQuiz = {
  start: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.START, params),
  complete: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.COMPLETE, params),
  abandon: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.ABANDON, params),
  answerCorrect: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.ANSWER_CORRECT, params),
  answerIncorrect: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.ANSWER_INCORRECT, params),
  reviewMistakes: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.QUIZ.REVIEW_MISTAKES, params),
};

export const trackFlashcard = {
  sessionStart: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.FLASHCARD.SESSION_START, params),
  sessionComplete: (params: QuizEventParams) =>
    logEvent(AnalyticsEvents.FLASHCARD.SESSION_COMPLETE, params),
  swipeRight: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.FLASHCARD.SWIPE_RIGHT, params),
  swipeLeft: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.FLASHCARD.SWIPE_LEFT, params),
  flip: (params: InstrumentEventParams) =>
    logEvent(AnalyticsEvents.FLASHCARD.FLIP, params),
};

export const trackSubscription = {
  viewPaywall: (params?: SubscriptionEventParams) =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.VIEW_PAYWALL, params),
  startCheckout: (params: SubscriptionEventParams) =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.START_CHECKOUT, params),
  complete: (params: SubscriptionEventParams) =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.COMPLETE, params),
  cancel: (params?: SubscriptionEventParams) =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.CANCEL, params),
  restore: () =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.RESTORE),
  freeLimitHit: (params: SubscriptionEventParams) =>
    logEvent(AnalyticsEvents.SUBSCRIPTION.FREE_LIMIT_HIT, params),
};

export const trackError = {
  api: (params: ErrorEventParams) =>
    logEvent(AnalyticsEvents.ERROR.API_ERROR, params),
  network: (params: ErrorEventParams) =>
    logEvent(AnalyticsEvents.ERROR.NETWORK_ERROR, params),
  crash: (params: ErrorEventParams) =>
    logEvent(AnalyticsEvents.ERROR.CRASH, params),
};

export const trackEngagement = {
  appOpen: () =>
    logEvent(AnalyticsEvents.ENGAGEMENT.APP_OPEN),
  appBackground: () =>
    logEvent(AnalyticsEvents.ENGAGEMENT.APP_BACKGROUND),
  share: (params: EngagementEventParams) =>
    logEvent(AnalyticsEvents.ENGAGEMENT.SHARE, params),
  rateApp: () =>
    logEvent(AnalyticsEvents.ENGAGEMENT.RATE_APP),
  feedbackSubmitted: () =>
    logEvent(AnalyticsEvents.ENGAGEMENT.FEEDBACK_SUBMITTED),
};
