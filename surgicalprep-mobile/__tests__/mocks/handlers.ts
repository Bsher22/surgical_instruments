/**
 * MSW (Mock Service Worker) Handlers
 * 
 * Defines mock API handlers for testing.
 * These handlers intercept network requests and return mock responses.
 */
import { http, HttpResponse, delay } from 'msw';
import { factories, mockResponses } from '../utils/test-utils';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// =============================================================================
// Auth Handlers
// =============================================================================

export const authHandlers = [
  // Login
  http.post(`${API_BASE_URL}/auth/login`, async () => {
    await delay(100);
    return HttpResponse.json(mockResponses.auth.login());
  }),

  // Register
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as any;
    return HttpResponse.json(
      factories.user({
        email: body.email,
        full_name: body.full_name,
        role: body.role,
      }),
      { status: 201 }
    );
  }),

  // Refresh token
  http.post(`${API_BASE_URL}/auth/refresh`, async () => {
    await delay(100);
    return HttpResponse.json({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'bearer',
    });
  }),

  // Logout
  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    await delay(100);
    return HttpResponse.json({ message: 'Successfully logged out' });
  }),
];

// =============================================================================
// User Handlers
// =============================================================================

export const userHandlers = [
  // Get current user
  http.get(`${API_BASE_URL}/users/me`, async () => {
    await delay(100);
    return HttpResponse.json(mockResponses.auth.user());
  }),

  // Update current user
  http.patch(`${API_BASE_URL}/users/me`, async ({ request }) => {
    await delay(100);
    const updates = await request.json() as any;
    return HttpResponse.json(factories.user(updates));
  }),

  // Get user limits
  http.get(`${API_BASE_URL}/users/me/limits`, async () => {
    await delay(100);
    return HttpResponse.json({
      cards_limit: 5,
      cards_used: 2,
      daily_quizzes_limit: 3,
      quizzes_used_today: 1,
      resets_at: new Date(Date.now() + 86400000).toISOString(),
    });
  }),

  // Get subscription status
  http.get(`${API_BASE_URL}/users/me/subscription`, async () => {
    await delay(100);
    return HttpResponse.json({
      is_premium: false,
      tier: 'free',
      expires_at: null,
    });
  }),
];

// =============================================================================
// Instrument Handlers
// =============================================================================

export const instrumentHandlers = [
  // List instruments
  http.get(`${API_BASE_URL}/instruments`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let instruments = [
      factories.instrument({ id: '1', name: 'Mayo Scissors', category: 'cutting' }),
      factories.instrument({ id: '2', name: 'Kelly Forceps', category: 'clamping' }),
      factories.instrument({ id: '3', name: 'Metzenbaum Scissors', category: 'cutting' }),
      factories.instrument({ id: '4', name: 'Debakey Forceps', category: 'grasping' }),
      factories.instrument({ id: '5', name: 'Army-Navy Retractor', category: 'retraction' }),
    ];

    if (category) {
      instruments = instruments.filter((i) => i.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      instruments = instruments.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) ||
          i.aliases.some((a: string) => a.toLowerCase().includes(searchLower))
      );
    }

    return HttpResponse.json(factories.paginatedResponse(instruments));
  }),

  // Get single instrument
  http.get(`${API_BASE_URL}/instruments/:id`, async ({ params }) => {
    await delay(100);
    const { id } = params;
    return HttpResponse.json(factories.instrument({ id: id as string }));
  }),

  // Get categories
  http.get(`${API_BASE_URL}/instruments/categories`, async () => {
    await delay(100);
    return HttpResponse.json(['cutting', 'clamping', 'grasping', 'retraction', 'suturing']);
  }),

  // Bookmark instrument
  http.post(`${API_BASE_URL}/instruments/:id/bookmark`, async () => {
    await delay(100);
    return HttpResponse.json({ is_bookmarked: true });
  }),

  // Unbookmark instrument
  http.delete(`${API_BASE_URL}/instruments/:id/bookmark`, async () => {
    await delay(100);
    return HttpResponse.json({ is_bookmarked: false });
  }),

  // Get bookmarked instruments
  http.get(`${API_BASE_URL}/instruments/bookmarked`, async () => {
    await delay(100);
    return HttpResponse.json(
      factories.paginatedResponse([
        factories.instrument({ id: '1', name: 'Mayo Scissors' }),
      ])
    );
  }),
];

// =============================================================================
// Preference Card Handlers
// =============================================================================

export const cardHandlers = [
  // List cards
  http.get(`${API_BASE_URL}/cards`, async () => {
    await delay(100);
    return HttpResponse.json(mockResponses.cards.list());
  }),

  // Get single card
  http.get(`${API_BASE_URL}/cards/:id`, async ({ params }) => {
    await delay(100);
    const { id } = params;
    return HttpResponse.json(mockResponses.cards.single(id as string));
  }),

  // Create card
  http.post(`${API_BASE_URL}/cards`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as any;
    return HttpResponse.json(
      factories.preferenceCard({
        id: 'new-card-id',
        ...body,
      }),
      { status: 201 }
    );
  }),

  // Update card
  http.put(`${API_BASE_URL}/cards/:id`, async ({ params, request }) => {
    await delay(100);
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json(
      factories.preferenceCard({
        id: id as string,
        ...body,
      })
    );
  }),

  // Partial update card
  http.patch(`${API_BASE_URL}/cards/:id`, async ({ params, request }) => {
    await delay(100);
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json(
      factories.preferenceCard({
        id: id as string,
        ...body,
      })
    );
  }),

  // Delete card
  http.delete(`${API_BASE_URL}/cards/:id`, async () => {
    await delay(100);
    return HttpResponse.json({ message: 'Card deleted' });
  }),

  // Duplicate card
  http.post(`${API_BASE_URL}/cards/:id/duplicate`, async ({ params }) => {
    await delay(100);
    const { id } = params;
    return HttpResponse.json(
      factories.preferenceCard({
        id: 'duplicated-card-id',
        title: 'Original Card (Copy)',
      }),
      { status: 201 }
    );
  }),

  // Get templates
  http.get(`${API_BASE_URL}/cards/templates`, async () => {
    await delay(100);
    return HttpResponse.json(
      factories.paginatedResponse([
        factories.preferenceCard({ id: 't1', title: 'Lap Chole Template', is_template: true }),
        factories.preferenceCard({ id: 't2', title: 'Total Knee Template', is_template: true }),
      ])
    );
  }),

  // Upload photo
  http.post(`${API_BASE_URL}/cards/:id/photos`, async () => {
    await delay(200);
    return HttpResponse.json({
      id: 'photo-123',
      url: 'https://example.com/uploaded-photo.jpg',
    });
  }),
];

// =============================================================================
// Quiz Handlers
// =============================================================================

export const quizHandlers = [
  // Start quiz session
  http.post(`${API_BASE_URL}/quiz/start`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as any;
    return HttpResponse.json(
      {
        session_id: 'session-123',
        quiz_type: body.quiz_type || 'multiple_choice',
        questions: [
          factories.quizQuestion({ id: 'q1' }),
          factories.quizQuestion({ id: 'q2' }),
          factories.quizQuestion({ id: 'q3' }),
          factories.quizQuestion({ id: 'q4' }),
          factories.quizQuestion({ id: 'q5' }),
        ].slice(0, body.question_count || 5),
      },
      { status: 201 }
    );
  }),

  // Submit answer
  http.post(`${API_BASE_URL}/quiz/:sessionId/answer`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as any;
    const isCorrect = body.answer === 'Option A';
    return HttpResponse.json({
      is_correct: isCorrect,
      correct_answer: 'Option A',
      explanation: 'This is the correct answer because...',
    });
  }),

  // Complete session
  http.post(`${API_BASE_URL}/quiz/:sessionId/complete`, async () => {
    await delay(100);
    return HttpResponse.json(mockResponses.quiz.complete());
  }),

  // Get quiz history
  http.get(`${API_BASE_URL}/quiz/history`, async () => {
    await delay(100);
    return HttpResponse.json(
      factories.paginatedResponse([
        factories.quizSession({ id: 's1', completed: true, correct_answers: 8 }),
        factories.quizSession({ id: 's2', completed: true, correct_answers: 6 }),
      ])
    );
  }),

  // Get quiz stats
  http.get(`${API_BASE_URL}/quiz/stats`, async () => {
    await delay(100);
    return HttpResponse.json({
      total_quizzes: 25,
      average_score: 78.5,
      instruments_studied: 45,
      current_streak: 5,
      longest_streak: 12,
    });
  }),

  // Get due for review
  http.get(`${API_BASE_URL}/quiz/due-for-review`, async () => {
    await delay(100);
    return HttpResponse.json({
      items: [
        factories.instrument({ id: '1', name: 'Mayo Scissors' }),
        factories.instrument({ id: '2', name: 'Kelly Forceps' }),
      ],
      count: 2,
    });
  }),
];

// =============================================================================
// Progress Handlers
// =============================================================================

export const progressHandlers = [
  // Get overall progress
  http.get(`${API_BASE_URL}/progress`, async () => {
    await delay(100);
    return HttpResponse.json({
      instruments_studied: 45,
      mastered_count: 12,
      in_progress_count: 20,
      not_started_count: 150,
    });
  }),

  // Get instrument progress
  http.get(`${API_BASE_URL}/progress/instruments/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json(
      factories.studyProgress({ instrument_id: params.id as string })
    );
  }),

  // Record study
  http.post(`${API_BASE_URL}/progress/instruments/:id/study`, async () => {
    await delay(100);
    return HttpResponse.json(
      factories.studyProgress({
        times_studied: 6,
        times_correct: 5,
        ease_factor: 2.6,
        interval: 5,
      })
    );
  }),

  // Get bookmarked
  http.get(`${API_BASE_URL}/progress/bookmarked`, async () => {
    await delay(100);
    return HttpResponse.json(
      factories.paginatedResponse([
        factories.instrument({ id: '1', name: 'Mayo Scissors' }),
      ])
    );
  }),
];

// =============================================================================
// Error Handlers (for testing error states)
// =============================================================================

export const errorHandlers = {
  // 401 Unauthorized
  unauthorized: http.get(`${API_BASE_URL}/*`, () => {
    return HttpResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    );
  }),

  // 403 Forbidden (premium required)
  premiumRequired: http.post(`${API_BASE_URL}/cards`, () => {
    return HttpResponse.json(
      { detail: 'Card limit reached. Upgrade to premium for unlimited cards.' },
      { status: 403 }
    );
  }),

  // 404 Not Found
  notFound: http.get(`${API_BASE_URL}/instruments/:id`, () => {
    return HttpResponse.json(
      { detail: 'Instrument not found' },
      { status: 404 }
    );
  }),

  // 500 Server Error
  serverError: http.get(`${API_BASE_URL}/*`, () => {
    return HttpResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Network Error
  networkError: http.get(`${API_BASE_URL}/*`, () => {
    return HttpResponse.error();
  }),
};

// =============================================================================
// Combined Handlers
// =============================================================================

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...instrumentHandlers,
  ...cardHandlers,
  ...quizHandlers,
  ...progressHandlers,
];

export default handlers;
