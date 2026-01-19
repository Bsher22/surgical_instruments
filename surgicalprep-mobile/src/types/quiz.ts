// Quiz Types for Stage 6D - Multiple Choice Quiz

export enum QuizQuestionType {
  IMAGE_TO_NAME = 'image_to_name',      // Show image, pick correct name
  NAME_TO_USE = 'name_to_use',          // Show name, pick primary use
  IMAGE_TO_CATEGORY = 'image_to_category', // Show image, pick category
}

export enum QuizDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  instrumentId: string;
  instrumentName: string;
  instrumentImageUrl?: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: QuizDifficulty;
  category: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface QuizConfig {
  questionCount: number;
  questionTypes: QuizQuestionType[];
  categories?: string[];
  difficulty?: QuizDifficulty;
  timerEnabled: boolean;
  timerSeconds: number; // Per question
}

export interface QuizSessionState {
  sessionId: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizResultBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface QuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // Percentage
  totalTimeMs: number;
  averageTimePerQuestionMs: number;
  breakdown: QuizResultBreakdown[];
  missedQuestions: QuizQuestion[];
  completedAt: string;
}

export interface QuizTimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

// API Response types
export interface StartQuizResponse {
  sessionId: string;
  questions: QuizQuestion[];
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  updatedProgress?: {
    instrumentId: string;
    newConfidenceLevel: number;
    nextReviewDate: string;
  };
}

export interface EndQuizResponse {
  result: QuizSessionResult;
}
