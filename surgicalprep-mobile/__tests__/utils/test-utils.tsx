/**
 * Test Utilities
 * 
 * Custom render function and utilities for testing React Native components
 * with all necessary providers wrapped.
 */
import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// =============================================================================
// Test Query Client
// =============================================================================

/**
 * Creates a new QueryClient configured for testing.
 * Disables retries and caching for predictable test behavior.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// =============================================================================
// Mock Auth Context
// =============================================================================

interface MockAuthState {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_premium: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: jest.Mock;
  logout: jest.Mock;
  register: jest.Mock;
}

const defaultMockAuthState: MockAuthState = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'surgical_tech',
    is_premium: false,
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

// =============================================================================
// All Providers Wrapper
// =============================================================================

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  authState?: Partial<MockAuthState>;
}

/**
 * Wraps children with all necessary providers for testing.
 */
function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  authState = {},
}: AllProvidersProps): ReactElement {
  const mergedAuthState = { ...defaultMockAuthState, ...authState };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        {children}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

// =============================================================================
// Custom Render Function
// =============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authState?: Partial<MockAuthState>;
  initialRoute?: string;
}

/**
 * Custom render function that wraps component with all providers.
 */
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): ReturnType<typeof render> {
  const { queryClient, authState, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} authState={authState}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Factory functions to create test data.
 */
export const factories = {
  user: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'surgical_tech',
    institution: 'Test Hospital',
    is_premium: false,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  instrument: (overrides = {}) => ({
    id: 'instrument-123',
    name: 'Test Instrument',
    aliases: ['Alias 1', 'Alias 2'],
    category: 'cutting',
    description: 'A test instrument for testing purposes.',
    primary_uses: ['Use 1', 'Use 2'],
    common_procedures: ['Procedure 1', 'Procedure 2'],
    handling_notes: 'Handle with care.',
    image_url: 'https://example.com/image.jpg',
    is_premium: false,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  preferenceCard: (overrides = {}) => ({
    id: 'card-123',
    user_id: 'user-123',
    title: 'Test Card',
    surgeon_name: 'Dr. Test',
    procedure_name: 'Test Procedure',
    specialty: 'general',
    general_notes: 'General notes here.',
    setup_notes: 'Setup notes here.',
    is_template: false,
    is_public: false,
    items: [],
    photos: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  cardItem: (overrides = {}) => ({
    id: 'item-123',
    card_id: 'card-123',
    instrument_id: 'instrument-123',
    custom_name: null,
    quantity: 1,
    size: 'Medium',
    notes: null,
    category: 'instruments',
    sort_order: 0,
    ...overrides,
  }),

  quizSession: (overrides = {}) => ({
    id: 'session-123',
    user_id: 'user-123',
    quiz_type: 'multiple_choice',
    category: null,
    total_questions: 10,
    correct_answers: 0,
    completed: false,
    started_at: '2024-01-01T00:00:00Z',
    completed_at: null,
    ...overrides,
  }),

  quizQuestion: (overrides = {}) => ({
    id: 'question-123',
    instrument_id: 'instrument-123',
    question_type: 'image_to_name',
    image_url: 'https://example.com/image.jpg',
    question_text: 'What instrument is shown?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 'Option A',
    ...overrides,
  }),

  studyProgress: (overrides = {}) => ({
    id: 'progress-123',
    user_id: 'user-123',
    instrument_id: 'instrument-123',
    times_studied: 5,
    times_correct: 4,
    last_studied: '2024-01-01T00:00:00Z',
    next_review: '2024-01-05T00:00:00Z',
    ease_factor: 2.5,
    interval: 4,
    is_bookmarked: false,
    ...overrides,
  }),

  paginatedResponse: <T>(items: T[], overrides = {}) => ({
    items,
    total: items.length,
    page: 1,
    size: 20,
    pages: 1,
    ...overrides,
  }),
};

// =============================================================================
// Mock API Responses
// =============================================================================

/**
 * Pre-built mock API responses for common scenarios.
 */
export const mockResponses = {
  instruments: {
    list: () => factories.paginatedResponse([
      factories.instrument({ id: '1', name: 'Mayo Scissors' }),
      factories.instrument({ id: '2', name: 'Kelly Forceps' }),
      factories.instrument({ id: '3', name: 'Metzenbaum Scissors' }),
    ]),
    single: (id = 'instrument-123') => factories.instrument({ id }),
    empty: () => factories.paginatedResponse([]),
  },

  cards: {
    list: () => factories.paginatedResponse([
      factories.preferenceCard({ id: '1', title: 'Lap Chole' }),
      factories.preferenceCard({ id: '2', title: 'Appendectomy' }),
    ]),
    single: (id = 'card-123') => factories.preferenceCard({
      id,
      items: [
        factories.cardItem({ id: 'item-1', sort_order: 0 }),
        factories.cardItem({ id: 'item-2', sort_order: 1 }),
      ],
    }),
    empty: () => factories.paginatedResponse([]),
  },

  quiz: {
    start: () => ({
      session_id: 'session-123',
      quiz_type: 'multiple_choice',
      questions: [
        factories.quizQuestion({ id: '1' }),
        factories.quizQuestion({ id: '2' }),
        factories.quizQuestion({ id: '3' }),
      ],
    }),
    answer: (correct = true) => ({
      is_correct: correct,
      correct_answer: 'Option A',
      explanation: 'This is the explanation.',
    }),
    complete: () => ({
      session_id: 'session-123',
      score: 80,
      correct_answers: 8,
      total_questions: 10,
      time_taken_seconds: 120,
    }),
  },

  auth: {
    login: () => ({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
    }),
    user: () => factories.user(),
  },
};

// =============================================================================
// Async Utilities
// =============================================================================

/**
 * Wait for a specific amount of time.
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wait for all pending promises to resolve.
 */
export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

/**
 * Wait for a condition to be true.
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await wait(interval);
  }
};

// =============================================================================
// Event Simulation Helpers
// =============================================================================

/**
 * Simulates a text input change event.
 */
export const simulateTextInput = (
  element: any,
  text: string,
  fireEvent: any
): void => {
  fireEvent.changeText(element, text);
};

/**
 * Simulates a swipe gesture.
 */
export const simulateSwipe = (
  element: any,
  direction: 'left' | 'right' | 'up' | 'down',
  fireEvent: any
): void => {
  const gestureState = {
    left: { dx: -100, dy: 0 },
    right: { dx: 100, dy: 0 },
    up: { dx: 0, dy: -100 },
    down: { dx: 0, dy: 100 },
  };

  fireEvent(element, 'onGestureEvent', {
    nativeEvent: { translationX: gestureState[direction].dx, translationY: gestureState[direction].dy },
  });
};

// =============================================================================
// Exports
// =============================================================================

// Re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';

// Export custom render as default render
export { customRender as render };

// Export providers for manual use
export { AllProviders };

// Export default auth state for extending
export { defaultMockAuthState };
