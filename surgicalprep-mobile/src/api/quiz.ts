// Quiz API Client - Stage 6D
import { apiClient } from './client';
import type {
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizSessionResult,
  StartQuizResponse,
  SubmitAnswerResponse,
  EndQuizResponse,
} from '../types/quiz';

/**
 * Start a new multiple choice quiz session
 */
export async function startMultipleChoiceQuiz(
  config: QuizConfig
): Promise<StartQuizResponse> {
  const response = await apiClient.post<StartQuizResponse>(
    '/quiz/multiple-choice/start',
    config
  );
  return response.data;
}

/**
 * Submit an answer for a quiz question
 */
export async function submitQuizAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentMs: number
): Promise<SubmitAnswerResponse> {
  const response = await apiClient.post<SubmitAnswerResponse>(
    `/quiz/sessions/${sessionId}/answer`,
    {
      questionId,
      selectedOptionId,
      timeSpentMs,
    }
  );
  return response.data;
}

/**
 * End a quiz session and get results
 */
export async function endQuizSession(
  sessionId: string,
  abandoned: boolean = false
): Promise<EndQuizResponse> {
  const response = await apiClient.post<EndQuizResponse>(
    `/quiz/sessions/${sessionId}/end`,
    { abandoned }
  );
  return response.data;
}

/**
 * Get quiz session details (for resuming)
 */
export async function getQuizSession(
  sessionId: string
): Promise<{
  session: {
    id: string;
    config: QuizConfig;
    questions: QuizQuestion[];
    answers: QuizAnswer[];
    currentIndex: number;
    status: string;
  };
}> {
  const response = await apiClient.get(`/quiz/sessions/${sessionId}`);
  return response.data;
}

/**
 * Get quiz history
 */
export async function getQuizHistory(params?: {
  limit?: number;
  offset?: number;
  quizType?: 'multiple_choice' | 'flashcard';
}): Promise<{
  sessions: QuizSessionResult[];
  total: number;
}> {
  const response = await apiClient.get('/quiz/history', { params });
  return response.data;
}

/**
 * Get questions that were answered incorrectly in a session
 */
export async function getMissedQuestions(
  sessionId: string
): Promise<{ questions: QuizQuestion[] }> {
  const response = await apiClient.get(`/quiz/sessions/${sessionId}/missed`);
  return response.data;
}
