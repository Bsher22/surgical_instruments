// Preference Card Types - Stage 4B

export type Specialty = 
  | 'general_surgery'
  | 'orthopedic'
  | 'cardiovascular'
  | 'neurosurgery'
  | 'obstetrics_gynecology'
  | 'urology'
  | 'plastic_surgery'
  | 'ent'
  | 'ophthalmology'
  | 'other';

export type ItemCategory = 
  | 'instruments'
  | 'supplies'
  | 'sutures'
  | 'implants'
  | 'special';

export interface PreferenceCardItem {
  id: string;
  card_id: string;
  instrument_id?: string;
  custom_name?: string;
  quantity: number;
  size?: string;
  notes?: string;
  category: ItemCategory;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Populated from instrument relation
  instrument?: {
    id: string;
    name: string;
    image_url?: string;
    category: string;
  };
}

export interface PreferenceCard {
  id: string;
  user_id: string;
  title: string;
  surgeon_name?: string;
  procedure_name?: string;
  specialty?: Specialty;
  general_notes?: string;
  setup_notes?: string;
  is_template: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items?: PreferenceCardItem[];
  photos?: CardPhoto[];
  item_count?: number;
}

export interface CardPhoto {
  id: string;
  card_id: string;
  url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface CardsListParams {
  search?: string;
  specialty?: Specialty;
  page?: number;
  limit?: number;
}

export interface CardsListResponse {
  cards: PreferenceCard[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface UserCardLimits {
  used: number;
  max: number;
  is_premium: boolean;
}

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  general_surgery: 'General Surgery',
  orthopedic: 'Orthopedic',
  cardiovascular: 'Cardiovascular',
  neurosurgery: 'Neurosurgery',
  obstetrics_gynecology: 'OB/GYN',
  urology: 'Urology',
  plastic_surgery: 'Plastic Surgery',
  ent: 'ENT',
  ophthalmology: 'Ophthalmology',
  other: 'Other',
};

export const SPECIALTY_OPTIONS: { value: Specialty; label: string }[] = 
  Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({
    value: value as Specialty,
    label,
  }));
