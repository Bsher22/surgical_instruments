// ============================================================================
// Stage 6C: Flashcard Session Hooks
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useFlashcardStore,
  selectCurrentCard,
  selectProgress,
  selectIsSessionActive,
  selectIsSessionComplete,
} from '../stores/flashcardStore';
import {
  FlashcardSessionConfig,
  SwipeDirection,
  SessionResults,
  SpacedRepetitionData,
} from '../types/flashcard';
import { Instrument } from '../types';
import { quizApi } from '../api/quiz';
import { triggerHaptic } from '../utils/haptics';

// ============================================================================
// useFlashcardSession - Main hook for managing flashcard sessions
// ============================================================================

interface UseFlashcardSessionOptions {
  onSessionComplete?: (results: SessionResults) => void;
  onError?: (error: Error) => void;
}

export const useFlashcardSession = (options: UseFlashcardSessionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSessionComplete, onError } = options;
  
  // Store state
  const session = useFlashcardStore((state) => state.session);
  const currentCard = useFlashcardStore(selectCurrentCard);
  const progress = useFlashcardStore(selectProgress);
  const isActive = useFlashcardStore(selectIsSessionActive);
  const isComplete = useFlashcardStore(selectIsSessionComplete);
  const isLoading = useFlashcardStore((state) => state.isLoading);
  const error = useFlashcardStore((state) => state.error);
  
  // Store actions
  const initializeSession = useFlashcardStore((state) => state.initializeSession);
  const startSession = useFlashcardStore((state) => state.startSession);
  const pauseSession = useFlashcardStore((state) => state.pauseSession);
  const resumeSession = useFlashcardStore((state) => state.resumeSession);
  const flipCard = useFlashcardStore((state) => state.flipCard);
  const handleSwipe = useFlashcardStore((state) => state.handleSwipe);
  const completeSession = useFlashcardStore((state) => state.completeSession);
  const resetSession = useFlashcardStore((state) => state.resetSession);
  const startMistakesReview = useFlashcardStore((state) => state.startMistakesReview);
  const getIncorrectCards = useFlashcardStore((state) => state.getIncorrectCards);
  
  // Mutation for recording session results
  const recordSessionMutation = useMutation({
    mutationFn: async (results: SessionResults) => {
      return quizApi.recordFlashcardSession(results);
    },
    onSuccess: () => {
      // Invalidate study progress queries to refresh stats
      queryClient.invalidateQueries({ queryKey: ['studyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['dueForReview'] });
    },
    onError: (err: Error) => {
      console.error('Failed to record session:', err);
      onError?.(err);
    },
  });
  
  // Initialize a new session with config and instruments
  const initialize = useCallback(
    (config: FlashcardSessionConfig, instruments: Instrument[]) => {
      if (instruments.length === 0) {
        onError?.(new Error('No instruments available for study'));
        return;
      }
      initializeSession(config, instruments);
    },
    [initializeSession, onError]
  );
  
  // Start the initialized session
  const start = useCallback(() => {
    if (!session) {
      onError?.(new Error('No session initialized'));
      return;
    }
    triggerHaptic('light');
    startSession();
  }, [session, startSession, onError]);
  
  // Handle card flip
  const flip = useCallback(() => {
    if (!currentCard) return;
    flipCard(currentCard.id);
  }, [currentCard, flipCard]);
  
  // Handle swipe gesture
  const swipe = useCallback(
    (direction: SwipeDirection, responseTime: number) => {
      handleSwipe(direction, responseTime);
    },
    [handleSwipe]
  );
  
  // Complete and record session
  const complete = useCallback(async () => {
    const results = completeSession();
    if (results) {
      onSessionComplete?.(results);
      
      // Record to backend
      try {
        await recordSessionMutation.mutateAsync(results);
      } catch (err) {
        // Session is still saved locally even if backend fails
        console.error('Failed to sync session to backend:', err);
      }
    }
    return results;
  }, [completeSession, onSessionComplete, recordSessionMutation]);
  
  // Effect to auto-complete when all cards are done
  useEffect(() => {
    if (isComplete && session?.completedAt) {
      const results = {
        sessionId: session.id,
        totalCards: session.config.cardCount,
        gotItCount: session.results.filter((r) => r.gotIt).length,
        studyMoreCount: session.results.filter((r) => !r.gotIt).length,
        averageResponseTime:
          session.results.length > 0
            ? session.results.reduce((a, r) => a + r.responseTime, 0) /
              session.results.length
            : 0,
        fastestResponse:
          session.results.length > 0
            ? Math.min(...session.results.map((r) => r.responseTime))
            : 0,
        slowestResponse:
          session.results.length > 0
            ? Math.max(...session.results.map((r) => r.responseTime))
            : 0,
        accuracy:
          session.results.length > 0
            ? (session.results.filter((r) => r.gotIt).length /
                session.results.length) *
              100
            : 0,
        cardResults: session.results,
        startedAt: session.startedAt || new Date(),
        completedAt: session.completedAt,
        duration: session.startedAt
          ? Math.round(
              (session.completedAt.getTime() - session.startedAt.getTime()) /
                1000
            )
          : 0,
      };
      
      onSessionComplete?.(results);
      recordSessionMutation.mutate(results);
    }
  }, [isComplete, session, onSessionComplete, recordSessionMutation]);
  
  return {
    // State
    session,
    currentCard,
    progress,
    isActive,
    isComplete,
    isLoading,
    error,
    
    // Actions
    initialize,
    start,
    pause: pauseSession,
    resume: resumeSession,
    flip,
    swipe,
    complete,
    reset: resetSession,
    reviewMistakes: startMistakesReview,
    getIncorrectCards,
    
    // Recording status
    isRecording: recordSessionMutation.isPending,
    recordError: recordSessionMutation.error,
  };
};

// ============================================================================
// useFlashcardInstruments - Hook for fetching instruments for flashcard study
// ============================================================================

interface UseFlashcardInstrumentsOptions {
  categoryIds?: string[];
  mode: 'all' | 'due_review' | 'bookmarked';
  limit?: number;
}

export const useFlashcardInstruments = (options: UseFlashcardInstrumentsOptions) => {
  const { categoryIds, mode, limit = 20 } = options;
  
  return useQuery({
    queryKey: ['flashcardInstruments', { categoryIds, mode, limit }],
    queryFn: async () => {
      switch (mode) {
        case 'due_review':
          return quizApi.getDueForReview(limit);
        case 'bookmarked':
          return quizApi.getBookmarkedInstruments(limit);
        case 'all':
        default:
          return quizApi.getInstrumentsForStudy({ categoryIds, limit });
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================================================
// useSpacedRepetition - Hook for spaced repetition calculations
// ============================================================================

export const useSpacedRepetition = () => {
  /**
   * SM-2 Algorithm Implementation
   * 
   * Quality ratings:
   * 0 - Complete failure
   * 1 - Near complete failure
   * 2 - Remembered with difficulty
   * 3 - Remembered with some difficulty
   * 4 - Remembered easily
   * 5 - Perfect recall
   */
  
  const calculateNextReview = useCallback(
    (current: SpacedRepetitionData, quality: number): SpacedRepetitionData => {
      let { easeFactor, interval, repetitions } = current;
      
      // Quality should be 0-5
      quality = Math.max(0, Math.min(5, quality));
      
      if (quality < 3) {
        // Failed - reset repetitions
        repetitions = 0;
        interval = 1;
      } else {
        // Success
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
      }
      
      // Update ease factor
      easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
      
      // Calculate next review date
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);
      
      return {
        ...current,
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewDate: new Date(),
      };
    },
    []
  );
  
  // Convert swipe to quality rating
  const swipeToQuality = useCallback(
    (gotIt: boolean, responseTime: number): number => {
      if (!gotIt) {
        // Swipe left - didn't know it
        return responseTime < 3000 ? 1 : 0;
      }
      
      // Swipe right - knew it
      if (responseTime < 2000) {
        return 5; // Quick recall
      } else if (responseTime < 4000) {
        return 4; // Good recall
      } else {
        return 3; // Slow but correct
      }
    },
    []
  );
  
  return {
    calculateNextReview,
    swipeToQuality,
  };
};

// ============================================================================
// useSessionTimer - Hook for tracking session duration
// ============================================================================

export const useSessionTimer = (isActive: boolean) => {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isActive) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);
  
  const reset = useCallback(() => {
    startTimeRef.current = null;
    setElapsed(0);
  }, []);
  
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  return {
    elapsed,
    formatted: formatTime(elapsed),
    reset,
  };
};
