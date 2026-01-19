// ============================================================================
// Stage 6C: Flashcard Types
// ============================================================================

import { Instrument } from './index';

// Direction of swipe gesture
export type SwipeDirection = 'left' | 'right';

// Confidence level for spaced repetition
export type ConfidenceLevel = 'again' | 'hard' | 'good' | 'easy';

// Individual flashcard item
export interface FlashcardItem {
  id: string;
  instrument: Instrument;
  isFlipped: boolean;
  swipeDirection?: SwipeDirection;
  responseTime?: number; // milliseconds to respond
}

// Flashcard session configuration
export interface FlashcardSessionConfig {
  categoryIds?: string[];
  instrumentIds?: string[];
  mode: 'all' | 'due_review' | 'bookmarked' | 'custom';
  cardCount: number;
  shuffled: boolean;
}

// Session state
export type FlashcardSessionStatus = 'idle' | 'loading' | 'active' | 'paused' | 'completed';

// Individual card result
export interface CardResult {
  instrumentId: string;
  instrumentName: string;
  gotIt: boolean; // right swipe = true, left swipe = false
  responseTime: number;
  timestamp: Date;
}

// Session results summary
export interface SessionResults {
  sessionId: string;
  totalCards: number;
  gotItCount: number;
  studyMoreCount: number;
  averageResponseTime: number;
  fastestResponse: number;
  slowestResponse: number;
  accuracy: number; // percentage
  cardResults: CardResult[];
  startedAt: Date;
  completedAt: Date;
  duration: number; // seconds
}

// Flashcard session state
export interface FlashcardSession {
  id: string;
  config: FlashcardSessionConfig;
  status: FlashcardSessionStatus;
  cards: FlashcardItem[];
  currentIndex: number;
  results: CardResult[];
  startedAt?: Date;
  completedAt?: Date;
}

// Props for FlashCard component
export interface FlashCardProps {
  item: FlashcardItem;
  onFlip: () => void;
  isActive: boolean;
}

// Props for SwipeableCardStack
export interface SwipeableCardStackProps {
  cards: FlashcardItem[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, cardId: string) => void;
  onFlip: (cardId: string) => void;
}

// Props for SessionSummary
export interface SessionSummaryProps {
  results: SessionResults;
  onRestart: () => void;
  onReviewMistakes: () => void;
  onGoHome: () => void;
}

// Props for ProgressBar
export interface FlashcardProgressBarProps {
  current: number;
  total: number;
  gotItCount: number;
  studyMoreCount: number;
}

// Animation state for card
export interface CardAnimationState {
  isFlipping: boolean;
  isSwiping: boolean;
  swipeX: number;
  swipeY: number;
  rotation: number;
  opacity: number;
  scale: number;
}

// Spaced repetition data for an instrument
export interface SpacedRepetitionData {
  instrumentId: string;
  easeFactor: number; // SM-2 ease factor (default 2.5)
  interval: number; // days until next review
  repetitions: number; // consecutive correct responses
  nextReviewDate: Date;
  lastReviewDate?: Date;
}

// API response for starting a flashcard session
export interface StartFlashcardSessionResponse {
  sessionId: string;
  instruments: Instrument[];
}

// API request for recording flashcard response
export interface RecordFlashcardResponseRequest {
  sessionId: string;
  instrumentId: string;
  gotIt: boolean;
  responseTime: number;
}

// Haptic feedback types
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
