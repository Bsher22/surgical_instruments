// ============================================================================
// Stage 6C: Flashcard Store
// ============================================================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  FlashcardSession,
  FlashcardSessionConfig,
  FlashcardSessionStatus,
  FlashcardItem,
  CardResult,
  SessionResults,
  SwipeDirection,
} from '../types/flashcard';
import { Instrument } from '../types';

interface FlashcardState {
  // Current session
  session: FlashcardSession | null;
  
  // Session history (last 10 sessions for quick access)
  recentSessions: SessionResults[];
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeSession: (config: FlashcardSessionConfig, instruments: Instrument[]) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Card interactions
  flipCard: (cardId: string) => void;
  handleSwipe: (direction: SwipeDirection, responseTime: number) => void;
  goToNextCard: () => void;
  goToPreviousCard: () => void;
  
  // Session completion
  completeSession: () => SessionResults | null;
  
  // Reset
  resetSession: () => void;
  clearError: () => void;
  
  // Review mistakes
  getIncorrectCards: () => FlashcardItem[];
  startMistakesReview: () => void;
}

// Utility to shuffle array (Fisher-Yates algorithm)
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Create flashcard items from instruments
const createFlashcardItems = (instruments: Instrument[], shuffle: boolean): FlashcardItem[] => {
  const items: FlashcardItem[] = instruments.map((instrument) => ({
    id: uuidv4(),
    instrument,
    isFlipped: false,
  }));
  
  return shuffle ? shuffleArray(items) : items;
};

// Calculate session results
const calculateResults = (session: FlashcardSession): SessionResults => {
  const { results, startedAt, config } = session;
  const completedAt = new Date();
  
  const gotItCount = results.filter((r) => r.gotIt).length;
  const studyMoreCount = results.filter((r) => !r.gotIt).length;
  const responseTimes = results.map((r) => r.responseTime);
  
  return {
    sessionId: session.id,
    totalCards: config.cardCount,
    gotItCount,
    studyMoreCount,
    averageResponseTime: responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0,
    fastestResponse: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    slowestResponse: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    accuracy: results.length > 0 ? (gotItCount / results.length) * 100 : 0,
    cardResults: results,
    startedAt: startedAt || completedAt,
    completedAt,
    duration: startedAt 
      ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000) 
      : 0,
  };
};

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  session: null,
  recentSessions: [],
  isLoading: false,
  error: null,

  initializeSession: (config: FlashcardSessionConfig, instruments: Instrument[]) => {
    // Limit instruments to requested card count
    const limitedInstruments = instruments.slice(0, config.cardCount);
    
    const session: FlashcardSession = {
      id: uuidv4(),
      config: {
        ...config,
        cardCount: limitedInstruments.length,
      },
      status: 'idle',
      cards: createFlashcardItems(limitedInstruments, config.shuffled),
      currentIndex: 0,
      results: [],
    };
    
    set({ session, error: null });
  },

  startSession: () => {
    const { session } = get();
    if (!session) return;
    
    set({
      session: {
        ...session,
        status: 'active',
        startedAt: new Date(),
      },
    });
  },

  pauseSession: () => {
    const { session } = get();
    if (!session || session.status !== 'active') return;
    
    set({
      session: {
        ...session,
        status: 'paused',
      },
    });
  },

  resumeSession: () => {
    const { session } = get();
    if (!session || session.status !== 'paused') return;
    
    set({
      session: {
        ...session,
        status: 'active',
      },
    });
  },

  flipCard: (cardId: string) => {
    const { session } = get();
    if (!session) return;
    
    const updatedCards = session.cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: !card.isFlipped } : card
    );
    
    set({
      session: {
        ...session,
        cards: updatedCards,
      },
    });
  },

  handleSwipe: (direction: SwipeDirection, responseTime: number) => {
    const { session } = get();
    if (!session || session.status !== 'active') return;
    
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;
    
    // Record result
    const result: CardResult = {
      instrumentId: currentCard.instrument.id,
      instrumentName: currentCard.instrument.name,
      gotIt: direction === 'right',
      responseTime,
      timestamp: new Date(),
    };
    
    // Update card with swipe direction
    const updatedCards = session.cards.map((card, index) =>
      index === session.currentIndex
        ? { ...card, swipeDirection: direction, responseTime }
        : card
    );
    
    const newIndex = session.currentIndex + 1;
    const isComplete = newIndex >= session.cards.length;
    
    set({
      session: {
        ...session,
        cards: updatedCards,
        results: [...session.results, result],
        currentIndex: newIndex,
        status: isComplete ? 'completed' : 'active',
        completedAt: isComplete ? new Date() : undefined,
      },
    });
  },

  goToNextCard: () => {
    const { session } = get();
    if (!session) return;
    
    const newIndex = Math.min(session.currentIndex + 1, session.cards.length - 1);
    
    set({
      session: {
        ...session,
        currentIndex: newIndex,
      },
    });
  },

  goToPreviousCard: () => {
    const { session } = get();
    if (!session) return;
    
    const newIndex = Math.max(session.currentIndex - 1, 0);
    
    set({
      session: {
        ...session,
        currentIndex: newIndex,
      },
    });
  },

  completeSession: () => {
    const { session, recentSessions } = get();
    if (!session) return null;
    
    const results = calculateResults(session);
    
    // Add to recent sessions (keep last 10)
    const updatedRecentSessions = [results, ...recentSessions].slice(0, 10);
    
    set({
      session: {
        ...session,
        status: 'completed',
        completedAt: new Date(),
      },
      recentSessions: updatedRecentSessions,
    });
    
    return results;
  },

  resetSession: () => {
    set({
      session: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  getIncorrectCards: () => {
    const { session } = get();
    if (!session) return [];
    
    const incorrectIds = new Set(
      session.results.filter((r) => !r.gotIt).map((r) => r.instrumentId)
    );
    
    return session.cards.filter((card) => incorrectIds.has(card.instrument.id));
  },

  startMistakesReview: () => {
    const { session } = get();
    if (!session) return;
    
    const incorrectCards = get().getIncorrectCards();
    if (incorrectCards.length === 0) return;
    
    // Reset the cards for review
    const resetCards = incorrectCards.map((card) => ({
      ...card,
      id: uuidv4(), // New ID for fresh session
      isFlipped: false,
      swipeDirection: undefined,
      responseTime: undefined,
    }));
    
    const newSession: FlashcardSession = {
      id: uuidv4(),
      config: {
        ...session.config,
        mode: 'custom',
        cardCount: resetCards.length,
      },
      status: 'active',
      cards: resetCards,
      currentIndex: 0,
      results: [],
      startedAt: new Date(),
    };
    
    set({ session: newSession, error: null });
  },
}));

// Selectors
export const selectCurrentCard = (state: FlashcardState): FlashcardItem | null => {
  if (!state.session) return null;
  return state.session.cards[state.session.currentIndex] || null;
};

export const selectProgress = (state: FlashcardState) => {
  if (!state.session) return { current: 0, total: 0, percentage: 0 };
  
  const { currentIndex, cards, results } = state.session;
  const total = cards.length;
  const current = Math.min(currentIndex + 1, total);
  
  return {
    current,
    total,
    percentage: total > 0 ? (current / total) * 100 : 0,
    gotItCount: results.filter((r) => r.gotIt).length,
    studyMoreCount: results.filter((r) => !r.gotIt).length,
  };
};

export const selectIsSessionActive = (state: FlashcardState): boolean => {
  return state.session?.status === 'active';
};

export const selectIsSessionComplete = (state: FlashcardState): boolean => {
  return state.session?.status === 'completed';
};
