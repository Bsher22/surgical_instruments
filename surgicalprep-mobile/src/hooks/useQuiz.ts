// ============================================================================
// Quiz React Query Hooks
// ============================================================================

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getStudyStats,
  getQuizLimit,
  getDueForReview,
  getQuizHistory,
  getCategories,
  startQuizSession,
  submitAnswer,
  endQuizSession,
  getQuizSession,
  getQuizResults,
  getFlashcards,
  submitFlashcardResult,
  submitFlashcardResults,
  startReviewSession,
  getInstrumentProgress,
  bookmarkInstrument,
  unbookmarkInstrument,
  getBookmarkedInstruments,
} from '../api/quiz';
import type {
  QuizConfig,
  AnswerSubmission,
  FlashcardResult,
  QuizHistoryResponse,
} from '../types/quiz';

// ============================================================================
// Query Keys
// ============================================================================

export const quizKeys = {
  all: ['quiz'] as const,
  stats: () => [...quizKeys.all, 'stats'] as const,
  limit: () => [...quizKeys.all, 'limit'] as const,
  dueForReview: (categoryIds?: string[]) =>
    [...quizKeys.all, 'due-for-review', { categoryIds }] as const,
  history: (filters?: Record<string, unknown>) =>
    [...quizKeys.all, 'history', filters] as const,
  categories: () => [...quizKeys.all, 'categories'] as const,
  session: (id: string) => [...quizKeys.all, 'session', id] as const,
  results: (id: string) => [...quizKeys.all, 'results', id] as const,
  flashcards: (params?: Record<string, unknown>) =>
    [...quizKeys.all, 'flashcards', params] as const,
  instrumentProgress: (id: string) =>
    [...quizKeys.all, 'instrument-progress', id] as const,
  bookmarks: (params?: Record<string, unknown>) =>
    [...quizKeys.all, 'bookmarks', params] as const,
};

// ============================================================================
// Study Stats & Progress Hooks
// ============================================================================

/**
 * Hook to fetch user's study statistics
 */
export function useStudyStats() {
  return useQuery({
    queryKey: quizKeys.stats(),
    queryFn: getStudyStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch quiz limits for free tier
 */
export function useQuizLimit() {
  return useQuery({
    queryKey: quizKeys.limit(),
    queryFn: getQuizLimit,
    staleTime: 1000 * 60 * 1, // 1 minute - refresh often for limit tracking
  });
}

// ============================================================================
// Due for Review Hooks
// ============================================================================

/**
 * Hook to fetch instruments due for review
 */
export function useDueForReview(categoryIds?: string[], limit?: number) {
  return useQuery({
    queryKey: quizKeys.dueForReview(categoryIds),
    queryFn: () => getDueForReview({ categoryIds, limit }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// Quiz History Hooks
// ============================================================================

/**
 * Hook to fetch paginated quiz history
 */
export function useQuizHistory(params?: {
  page?: number;
  pageSize?: number;
  quizType?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: quizKeys.history(params),
    queryFn: () => getQuizHistory(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for infinite scrolling quiz history
 */
export function useInfiniteQuizHistory(params?: {
  pageSize?: number;
  quizType?: string;
  status?: string;
}) {
  return useInfiniteQuery<QuizHistoryResponse>({
    queryKey: quizKeys.history({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      getQuizHistory({
        ...params,
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// ============================================================================
// Categories Hooks
// ============================================================================

/**
 * Hook to fetch instrument categories
 */
export function useCategories() {
  return useQuery({
    queryKey: quizKeys.categories(),
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  });
}

// ============================================================================
// Quiz Session Hooks
// ============================================================================

/**
 * Hook to start a new quiz session
 */
export function useStartQuizSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: QuizConfig) => startQuizSession(config),
    onSuccess: () => {
      // Invalidate limit since we've used one
      queryClient.invalidateQueries({ queryKey: quizKeys.limit() });
    },
  });
}

/**
 * Hook to submit an answer
 */
export function useSubmitAnswer(sessionId: string) {
  return useMutation({
    mutationFn: (answer: AnswerSubmission) => submitAnswer(sessionId, answer),
  });
}

/**
 * Hook to end a quiz session
 */
export function useEndQuizSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      status = 'completed',
    }: {
      sessionId: string;
      status?: 'completed' | 'abandoned';
    }) => endQuizSession(sessionId, status),
    onSuccess: () => {
      // Invalidate relevant queries after quiz completion
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
      queryClient.invalidateQueries({ queryKey: quizKeys.history() });
      queryClient.invalidateQueries({ queryKey: quizKeys.dueForReview() });
    },
  });
}

/**
 * Hook to fetch a specific quiz session
 */
export function useQuizSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: quizKeys.session(sessionId),
    queryFn: () => getQuizSession(sessionId),
    enabled: enabled && !!sessionId,
  });
}

/**
 * Hook to fetch quiz results
 */
export function useQuizResults(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: quizKeys.results(sessionId),
    queryFn: () => getQuizResults(sessionId),
    enabled: enabled && !!sessionId,
  });
}

// ============================================================================
// Flashcard Hooks
// ============================================================================

/**
 * Hook to fetch flashcards
 */
export function useFlashcards(params?: {
  categoryIds?: string[];
  count?: number;
  dueOnly?: boolean;
}) {
  return useQuery({
    queryKey: quizKeys.flashcards(params),
    queryFn: () =>
      getFlashcards({
        categoryIds: params?.categoryIds,
        count: params?.count,
        dueOnly: params?.dueOnly,
      }),
    enabled: false, // Manual fetch - call refetch() when starting session
  });
}

/**
 * Hook to submit a single flashcard result
 */
export function useSubmitFlashcardResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result: FlashcardResult) => submitFlashcardResult(result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.dueForReview() });
    },
  });
}

/**
 * Hook to submit batch flashcard results
 */
export function useSubmitFlashcardResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (results: FlashcardResult[]) => submitFlashcardResults(results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
      queryClient.invalidateQueries({ queryKey: quizKeys.history() });
      queryClient.invalidateQueries({ queryKey: quizKeys.dueForReview() });
    },
  });
}

/**
 * Hook to start a review session for due instruments
 */
export function useStartReviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startReviewSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.limit() });
    },
  });
}

// ============================================================================
// Instrument Progress Hooks
// ============================================================================

/**
 * Hook to fetch progress for a specific instrument
 */
export function useInstrumentProgress(instrumentId: string, enabled = true) {
  return useQuery({
    queryKey: quizKeys.instrumentProgress(instrumentId),
    queryFn: () => getInstrumentProgress(instrumentId),
    enabled: enabled && !!instrumentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// Bookmark Hooks
// ============================================================================

/**
 * Hook to bookmark an instrument
 */
export function useBookmarkInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instrumentId: string) => bookmarkInstrument(instrumentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.bookmarks() });
    },
  });
}

/**
 * Hook to unbookmark an instrument
 */
export function useUnbookmarkInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instrumentId: string) => unbookmarkInstrument(instrumentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.bookmarks() });
    },
  });
}

/**
 * Hook to fetch bookmarked instruments
 */
export function useBookmarkedInstruments(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: quizKeys.bookmarks(params),
    queryFn: () => getBookmarkedInstruments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// Prefetch Helpers
// ============================================================================

/**
 * Prefetch study stats
 */
export function usePrefetchStudyStats() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: quizKeys.stats(),
      queryFn: getStudyStats,
    });
  };
}

/**
 * Prefetch categories
 */
export function usePrefetchCategories() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: quizKeys.categories(),
      queryFn: getCategories,
    });
  };
}
