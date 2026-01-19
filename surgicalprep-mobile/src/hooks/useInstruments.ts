import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  QueryKey,
} from '@tanstack/react-query';
import {
  getInstruments,
  getInstrument,
  searchInstruments,
  getCategories,
  getInstrumentsByIds,
  getPopularInstruments,
  getRelatedInstruments,
  CategoryCount,
} from '../api/instruments';
import type {
  Instrument,
  InstrumentListParams,
  InstrumentListResponse,
  InstrumentCategory,
} from '../types/instrument';

// Re-export types using aliases to match expected API
export type GetInstrumentsParams = InstrumentListParams;
export type InstrumentsResponse = InstrumentListResponse;
export type InstrumentDetail = Instrument;

export interface InstrumentSearchParams {
  query: string;
  category?: InstrumentCategory;
  limit?: number;
}

export interface InstrumentSearchResponse {
  items: Instrument[];
  total: number;
  query: string;
}

// Query key factory for consistent cache keys
export const instrumentKeys = {
  all: ['instruments'] as const,
  lists: () => [...instrumentKeys.all, 'list'] as const,
  list: (params: GetInstrumentsParams) => [...instrumentKeys.lists(), params] as const,
  details: () => [...instrumentKeys.all, 'detail'] as const,
  detail: (id: string) => [...instrumentKeys.details(), id] as const,
  search: (params: InstrumentSearchParams) => [...instrumentKeys.all, 'search', params] as const,
  categories: () => [...instrumentKeys.all, 'categories'] as const,
  popular: (limit?: number) => [...instrumentKeys.all, 'popular', limit] as const,
  related: (id: string, limit?: number) => [...instrumentKeys.all, 'related', id, limit] as const,
  batch: (ids: string[]) => [...instrumentKeys.all, 'batch', ids.sort().join(',')] as const,
};

/**
 * Hook for fetching paginated instruments list
 * 
 * @param params - Filter, sort, and pagination parameters
 * @param options - Additional React Query options
 * 
 * @example
 * const { data, isLoading, error } = useInstruments({ 
 *   category: 'cutting',
 *   limit: 20 
 * });
 */
export function useInstruments(
  params: GetInstrumentsParams = {},
  options?: Omit<UseQueryOptions<InstrumentsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.list(params),
    queryFn: () => getInstruments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook for infinite scrolling instruments list
 * 
 * @param params - Filter and sort parameters (page is managed automatically)
 * @param options - Additional React Query infinite options
 * 
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteInstruments({ category: 'grasping' });
 */
export function useInfiniteInstruments(
  params: Omit<GetInstrumentsParams, 'page'> = {},
  options?: Omit<
    UseInfiniteQueryOptions<InstrumentsResponse, Error, InstrumentsResponse, InstrumentsResponse, QueryKey, number>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery({
    queryKey: instrumentKeys.list({ ...params, page: 'infinite' } as GetInstrumentsParams),
    queryFn: ({ pageParam }) => getInstruments({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Check if there are more pages
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook for fetching a single instrument by ID
 * 
 * @param id - Instrument UUID
 * @param options - Additional React Query options
 * 
 * @example
 * const { data: instrument, isLoading } = useInstrument(instrumentId);
 */
export function useInstrument(
  id: string | undefined,
  options?: Omit<UseQueryOptions<InstrumentDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.detail(id!),
    queryFn: () => getInstrument(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - details change less frequently
    ...options,
  });
}

/**
 * Hook for searching instruments with full-text search
 * 
 * @param params - Search query and optional filters
 * @param options - Additional React Query options
 * 
 * @example
 * const { data } = useInstrumentSearch({ 
 *   query: debouncedSearchText,
 *   limit: 10 
 * });
 */
export function useInstrumentSearch(
  params: InstrumentSearchParams,
  options?: Omit<UseQueryOptions<InstrumentSearchResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.search(params),
    queryFn: () => searchInstruments(params),
    // Only run if there's a search query
    enabled: !!params.query && params.query.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    ...options,
  });
}

/**
 * Hook for fetching all categories with counts
 * 
 * @example
 * const { data: categories } = useCategories();
 * // [{ category: 'cutting', count: 45 }, ...]
 */
export function useCategories(
  options?: Omit<UseQueryOptions<CategoryCount[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.categories(),
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    ...options,
  });
}

/**
 * Hook for fetching popular/suggested instruments
 * 
 * @param limit - Number of instruments to fetch
 * 
 * @example
 * const { data: popular } = usePopularInstruments(10);
 */
export function usePopularInstruments(
  limit: number = 10,
  options?: Omit<UseQueryOptions<Instrument[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.popular(limit),
    queryFn: () => getPopularInstruments(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Hook for fetching related instruments
 * 
 * @param id - Source instrument ID
 * @param limit - Number of related instruments to fetch
 * 
 * @example
 * const { data: related } = useRelatedInstruments(instrumentId, 5);
 */
export function useRelatedInstruments(
  id: string | undefined,
  limit: number = 5,
  options?: Omit<UseQueryOptions<Instrument[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.related(id!, limit),
    queryFn: () => getRelatedInstruments(id!, limit),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook for fetching multiple instruments by IDs
 * Useful for loading instruments in a preference card
 * 
 * @param ids - Array of instrument IDs
 * 
 * @example
 * const { data: instruments } = useInstrumentsByIds(card.instrumentIds);
 */
export function useInstrumentsByIds(
  ids: string[],
  options?: Omit<UseQueryOptions<Instrument[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: instrumentKeys.batch(ids),
    queryFn: () => getInstrumentsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// Re-export types for convenience
export type {
  Instrument,
  InstrumentCategory,
};
