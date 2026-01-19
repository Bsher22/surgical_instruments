// src/types/instruments.ts
// Types for surgical instruments - should match backend Pydantic schemas

export interface Instrument {
  id: string;
  name: string;
  aliases: string[];
  category: InstrumentCategory;
  description: string;
  primary_uses: string[];
  common_procedures: string[];
  handling_notes: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export type InstrumentCategory =
  | 'cutting'
  | 'clamping'
  | 'grasping'
  | 'retracting'
  | 'suturing'
  | 'probing'
  | 'dilating'
  | 'suctioning'
  | 'specialty'
  | 'other';

export interface InstrumentQueryParams {
  search?: string;
  category?: InstrumentCategory | null;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Types for useInstruments hook
export interface GetInstrumentsParams {
  search?: string;
  category?: InstrumentCategory;
  page?: number;
  limit?: number;
}

export interface InstrumentsResponse {
  items: Instrument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InstrumentDetail extends Instrument {
  // Extended details if needed for detail view
}

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
