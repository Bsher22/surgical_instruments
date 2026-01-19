/**
 * Quiz & Study System Exports
 * SurgicalPrep - Stage 6A
 */

// Types
export * from './types/quiz';

// API
export { quizApi, default as quizApiDefault } from './api/quiz';
export {
  startQuizSession,
  getQuizSession,
  submitQuizAnswer,
  endQuizSession,
  abandonQuizSession,
  startFlashcardSession,
  getFlashcardSession,
  recordFlashcardResult,
  endFlashcardSession,
  getFlashcardDeck,
  getStudyProgress,
  getInstrumentProgress,
  getDueForReview,
  toggleInstrumentBookmark,
  resetInstrumentProgress,
  resetAllProgress,
  getQuizHistory,
  getQuizSessionDetails,
  getQuizLimits,
  startQuickQuiz,
  startReviewSession,
  startCategoryQuiz,
} from './api/quiz';

// Hooks
export { quizKeys, quizHooks } from './hooks/useQuiz';
export {
  // Progress hooks
  useStudyProgress,
  useInstrumentProgress,
  useDueForReview,
  useDueForReviewInfinite,
  
  // Quiz session hooks
  useQuizSession,
  useStartQuizSession,
  useSubmitQuizAnswer,
  useEndQuizSession,
  useAbandonQuizSession,
  
  // Flashcard hooks
  useFlashcardSession,
  useStartFlashcardSession,
  useRecordFlashcardResult,
  useEndFlashcardSession,
  useFlashcardDeck,
  
  // History hooks
  useQuizHistory,
  useQuizHistoryInfinite,
  useQuizSessionDetails,
  
  // Action hooks
  useToggleInstrumentBookmark,
  useResetInstrumentProgress,
  useResetAllProgress,
  
  // Limits hook
  useQuizLimits,
  
  // Prefetch helpers
  usePrefetchStudyProgress,
  usePrefetchDueForReview,
} from './hooks/useQuiz';

// Store
export {
  useQuizStore,
  selectHasActiveSession,
  selectSessionProgress,
  selectRemainingItems,
  selectIsSessionComplete,
  selectCurrentScorePercentage,
  selectFlashcardGotItRate,
} from './stores/quizStore';
