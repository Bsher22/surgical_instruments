// Instrument types matching backend Pydantic schemas

export type InstrumentCategory =
  | 'cutting'
  | 'clamping'
  | 'grasping'
  | 'retracting'
  | 'suturing'
  | 'suctioning'
  | 'dilating'
  | 'probing'
  | 'measuring'
  | 'specialty';

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

export interface InstrumentListParams {
  search?: string;
  category?: InstrumentCategory;
  page?: number;
  limit?: number;
}

export interface InstrumentListResponse {
  items: Instrument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InstrumentBookmark {
  instrument_id: string;
  bookmarked_at: string;
}

// Category display configuration
export const CATEGORY_CONFIG: Record<InstrumentCategory, { label: string; color: string; bgColor: string }> = {
  cutting: { label: 'Cutting', color: '#DC2626', bgColor: '#FEE2E2' },
  clamping: { label: 'Clamping', color: '#7C3AED', bgColor: '#EDE9FE' },
  grasping: { label: 'Grasping', color: '#2563EB', bgColor: '#DBEAFE' },
  retracting: { label: 'Retracting', color: '#059669', bgColor: '#D1FAE5' },
  suturing: { label: 'Suturing', color: '#D97706', bgColor: '#FEF3C7' },
  suctioning: { label: 'Suctioning', color: '#0891B2', bgColor: '#CFFAFE' },
  dilating: { label: 'Dilating', color: '#DB2777', bgColor: '#FCE7F3' },
  probing: { label: 'Probing', color: '#4F46E5', bgColor: '#E0E7FF' },
  measuring: { label: 'Measuring', color: '#65A30D', bgColor: '#ECFCCB' },
  specialty: { label: 'Specialty', color: '#6B7280', bgColor: '#F3F4F6' },
};
