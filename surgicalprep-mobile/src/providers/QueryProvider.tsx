// ============================================
// SurgicalPrep - Query Provider
// React Query setup with default options
// ============================================

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ApiError } from '../types';

// Create query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes (data is fresh for this long)
      staleTime: 5 * 60 * 1000,

      // Cache time: 30 minutes (cached data kept for this long after becoming unused)
      gcTime: 30 * 60 * 1000,

      // Retry failed queries 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on window focus in mobile app
      refetchOnWindowFocus: false,

      // Refetch when network reconnects
      refetchOnReconnect: true,

      // Keep previous data while fetching new data
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Error handler for all mutations
      onError: (error: Error) => {
        const apiError = error as ApiError;
        console.error('Mutation error:', apiError.detail || error.message);
      },
    },
  },
});

// Type for custom query meta
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export query client for use in prefetching or manual cache updates
export { queryClient };

// Query key factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Instruments
  instruments: {
    all: ['instruments'] as const,
    lists: () => [...queryKeys.instruments.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.instruments.lists(), params] as const,
    details: () => [...queryKeys.instruments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.instruments.details(), id] as const,
    search: (query: string) => [...queryKeys.instruments.all, 'search', query] as const,
    categories: () => [...queryKeys.instruments.all, 'categories'] as const,
    bookmarked: (params?: Record<string, unknown>) => [...queryKeys.instruments.all, 'bookmarked', params] as const,
  },

  // Preference Cards
  cards: {
    all: ['cards'] as const,
    lists: () => [...queryKeys.cards.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.cards.lists(), params] as const,
    details: () => [...queryKeys.cards.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cards.details(), id] as const,
    templates: (params?: Record<string, unknown>) => [...queryKeys.cards.all, 'templates', params] as const,
  },

  // Quiz & Study
  quiz: {
    all: ['quiz'] as const,
    sessions: () => [...queryKeys.quiz.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.quiz.sessions(), id] as const,
    active: () => [...queryKeys.quiz.all, 'active'] as const,
    history: (params?: Record<string, unknown>) => [...queryKeys.quiz.all, 'history', params] as const,
    flashcards: (params?: Record<string, unknown>) => [...queryKeys.quiz.all, 'flashcards', params] as const,
  },

  study: {
    all: ['study'] as const,
    stats: () => [...queryKeys.study.all, 'stats'] as const,
    due: (params?: Record<string, unknown>) => [...queryKeys.study.all, 'due', params] as const,
    progress: () => [...queryKeys.study.all, 'progress'] as const,
    instrumentProgress: (id: string) => [...queryKeys.study.progress(), id] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    subscription: () => [...queryKeys.user.all, 'subscription'] as const,
  },
} as const;

export default QueryProvider;
