import { apiClient } from './client';
import {
  Instrument,
  InstrumentListParams,
  InstrumentListResponse,
} from '../types/instrument';
import type {
  GetInstrumentsParams,
  InstrumentsResponse,
  InstrumentSearchParams,
  InstrumentSearchResponse,
  InstrumentCategory,
} from '../types/api/instruments';

// Category count type for categories endpoint
export interface CategoryCount {
  category: InstrumentCategory;
  count: number;
}

/**
 * Get a paginated list of instruments with optional filtering
 */
export async function getInstruments(
  params: InstrumentListParams = {}
): Promise<InstrumentListResponse> {
  const { search, category, page = 1, limit = 20 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (category) queryParams.set('category', category);
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));

  const response = await apiClient.get<InstrumentListResponse>(
    `/api/instruments?${queryParams.toString()}`
  );

  return response.data;
}

/**
 * Get a single instrument by ID
 */
export async function getInstrument(id: string): Promise<Instrument> {
  const response = await apiClient.get<Instrument>(`/api/instruments/${id}`);
  return response.data;
}

/**
 * Search instruments with full-text search
 */
export async function searchInstruments(
  query: string,
  limit: number = 10
): Promise<Instrument[]> {
  const response = await apiClient.get<Instrument[]>(
    `/api/instruments/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data;
}

/**
 * Get instruments by category
 */
export async function getInstrumentsByCategory(
  category: string,
  page: number = 1,
  limit: number = 20
): Promise<InstrumentListResponse> {
  return getInstruments({ category: category as any, page, limit });
}

/**
 * Get user's bookmarked instruments
 * Note: This will eventually sync with the backend, but for now uses local storage
 */
export async function getBookmarkedInstruments(
  ids: string[]
): Promise<Instrument[]> {
  if (ids.length === 0) return [];

  const response = await apiClient.post<Instrument[]>(
    '/api/instruments/batch',
    { ids }
  );
  return response.data;
}

/**
 * Get all categories with instrument counts
 */
export async function getCategories(): Promise<CategoryCount[]> {
  const response = await apiClient.get<CategoryCount[]>('/api/instruments/categories');
  return response.data;
}

/**
 * Get instruments by array of IDs
 */
export async function getInstrumentsByIds(ids: string[]): Promise<Instrument[]> {
  if (ids.length === 0) return [];

  const response = await apiClient.post<Instrument[]>('/api/instruments/batch', { ids });
  return response.data;
}

/**
 * Get popular/commonly studied instruments
 */
export async function getPopularInstruments(limit: number = 10): Promise<Instrument[]> {
  const response = await apiClient.get<Instrument[]>(`/api/instruments/popular?limit=${limit}`);
  return response.data;
}

/**
 * Get related instruments based on a source instrument
 */
export async function getRelatedInstruments(
  id: string,
  limit: number = 5
): Promise<Instrument[]> {
  const response = await apiClient.get<Instrument[]>(
    `/api/instruments/${id}/related?limit=${limit}`
  );
  return response.data;
}
