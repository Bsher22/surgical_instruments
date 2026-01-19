// src/api/queryClient.ts
// Optimized React Query configuration for SurgicalPrep

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useToastStore } from '../stores/toastStore';

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  // Static data that rarely changes
  STATIC: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days (formerly cacheTime)
  },
  // User-specific data that may change
  USER_DATA: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  // Frequently changing data
  DYNAMIC: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  // Real-time data (no caching)
  REALTIME: {
    staleTime: 0,
    gcTime: 0,
  },
} as const;

// Query key factories for type-safe cache invalidation
export const queryKeys = {
  // Instruments
  instruments: {
    all: ['instruments'] as const,
    lists: () => [...queryKeys.instruments.all, 'list'] as const,
    list: (params: Record<string, unknown>) => 
      [...queryKeys.instruments.lists(), params] as const,
    details: () => [...queryKeys.instruments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.instruments.details(), id] as const,
    search: (query: string) => 
      [...queryKeys.instruments.all, 'search', query] as const,
  },
  
  // Preference Cards
  cards: {
    all: ['cards'] as const,
    lists: () => [...queryKeys.cards.all, 'list'] as const,
    list: (params: Record<string, unknown>) => 
      [...queryKeys.cards.lists(), params] as const,
    details: () => [...queryKeys.cards.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cards.details(), id] as const,
    templates: () => [...queryKeys.cards.all, 'templates'] as const,
  },
  
  // Quiz & Study
  quiz: {
    all: ['quiz'] as const,
    sessions: () => [...queryKeys.quiz.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.quiz.sessions(), id] as const,
    progress: () => [...queryKeys.quiz.all, 'progress'] as const,
    dueForReview: () => [...queryKeys.quiz.all, 'dueForReview'] as const,
    history: (params: Record<string, unknown>) => 
      [...queryKeys.quiz.all, 'history', params] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    subscription: () => [...queryKeys.user.all, 'subscription'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
    bookmarks: () => [...queryKeys.user.all, 'bookmarks'] as const,
  },
} as const;

// Default options for queries based on data type
export const defaultQueryOptions = {
  instruments: {
    staleTime: CACHE_TIMES.STATIC.staleTime,
    gcTime: CACHE_TIMES.STATIC.gcTime,
  },
  cards: {
    staleTime: CACHE_TIMES.USER_DATA.staleTime,
    gcTime: CACHE_TIMES.USER_DATA.gcTime,
  },
  quiz: {
    staleTime: CACHE_TIMES.DYNAMIC.staleTime,
    gcTime: CACHE_TIMES.DYNAMIC.gcTime,
  },
  user: {
    staleTime: CACHE_TIMES.USER_DATA.staleTime,
    gcTime: CACHE_TIMES.USER_DATA.gcTime,
  },
} as const;

// Create the query client with optimized defaults
export const createQueryClient = () => {
  const showErrorToast = (message: string) => {
    const { addToast } = useToastStore.getState();
    addToast({
      type: 'error',
      message,
    });
  };

  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show error toast for queries that have already been successful before
        // This prevents showing errors during initial load
        if (query.state.data !== undefined) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Something went wrong';
          showErrorToast(`Failed to update: ${errorMessage}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Something went wrong';
        showErrorToast(errorMessage);
      },
    }),
    defaultOptions: {
      queries: {
        // Retry configuration with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (except 408, 429)
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
              return false;
            }
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Stale-while-revalidate defaults
        staleTime: CACHE_TIMES.USER_DATA.staleTime,
        gcTime: CACHE_TIMES.USER_DATA.gcTime,
        
        // Refetch behavior
        refetchOnWindowFocus: false, // Mobile apps don't have window focus
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode
        networkMode: 'offlineFirst', // Return cached data while offline
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        networkMode: 'offlineFirst',
      },
    },
  });
};

// Singleton instance
let queryClientInstance: QueryClient | null = null;

export const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
};

// Utility for prefetching data
export const prefetchQueries = async (queryClient: QueryClient) => {
  // Prefetch commonly accessed data
  // This can be called after login or app initialization
  
  // Example: Prefetch instrument categories
  // await queryClient.prefetchQuery({
  //   queryKey: queryKeys.instruments.lists(),
  //   queryFn: () => instrumentsApi.getInstruments({ limit: 20 }),
  // });
};

// Utility for invalidating related queries
export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  entity: 'instruments' | 'cards' | 'quiz' | 'user'
) => {
  switch (entity) {
    case 'instruments':
      queryClient.invalidateQueries({ queryKey: queryKeys.instruments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz.dueForReview() });
      break;
    case 'cards':
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() });
      break;
    case 'quiz':
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() });
      break;
    case 'user':
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      break;
  }
};

export default getQueryClient;
