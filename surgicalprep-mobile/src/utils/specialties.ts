// src/utils/specialties.ts
// Surgical specialties list for preference cards

export interface Specialty {
  id: string;
  label: string;
  abbreviation?: string;
}

export const SURGICAL_SPECIALTIES: Specialty[] = [
  { id: 'general', label: 'General Surgery', abbreviation: 'GS' },
  { id: 'orthopedic', label: 'Orthopedic Surgery', abbreviation: 'Ortho' },
  { id: 'cardiovascular', label: 'Cardiovascular/Thoracic', abbreviation: 'CV' },
  { id: 'neurosurgery', label: 'Neurosurgery', abbreviation: 'Neuro' },
  { id: 'obgyn', label: 'OB/GYN', abbreviation: 'OB' },
  { id: 'urology', label: 'Urology', abbreviation: 'Uro' },
  { id: 'ent', label: 'ENT (Otolaryngology)', abbreviation: 'ENT' },
  { id: 'plastic', label: 'Plastic Surgery', abbreviation: 'Plastics' },
  { id: 'ophthalmology', label: 'Ophthalmology', abbreviation: 'Ophtho' },
  { id: 'oral_maxillofacial', label: 'Oral/Maxillofacial', abbreviation: 'OMFS' },
  { id: 'pediatric', label: 'Pediatric Surgery', abbreviation: 'Peds' },
  { id: 'trauma', label: 'Trauma Surgery', abbreviation: 'Trauma' },
  { id: 'vascular', label: 'Vascular Surgery', abbreviation: 'Vasc' },
  { id: 'colorectal', label: 'Colorectal Surgery', abbreviation: 'CR' },
  { id: 'transplant', label: 'Transplant Surgery', abbreviation: 'Transplant' },
  { id: 'bariatric', label: 'Bariatric Surgery', abbreviation: 'Bariatric' },
  { id: 'oncology', label: 'Surgical Oncology', abbreviation: 'Onc' },
  { id: 'spine', label: 'Spine Surgery', abbreviation: 'Spine' },
  { id: 'hand', label: 'Hand Surgery', abbreviation: 'Hand' },
  { id: 'podiatry', label: 'Podiatry', abbreviation: 'Pod' },
  { id: 'other', label: 'Other', abbreviation: 'Other' },
];

/**
 * Get specialty by ID
 */
export function getSpecialtyById(id: string): Specialty | undefined {
  return SURGICAL_SPECIALTIES.find((s) => s.id === id);
}

/**
 * Get specialty label by ID
 */
export function getSpecialtyLabel(id: string): string {
  const specialty = getSpecialtyById(id);
  return specialty?.label ?? id;
}

/**
 * Check if a specialty ID is valid
 */
export function isValidSpecialty(id: string): boolean {
  return SURGICAL_SPECIALTIES.some((s) => s.id === id);
}

/**
 * Get specialties as picker options
 */
export function getSpecialtyOptions(): { value: string; label: string }[] {
  return SURGICAL_SPECIALTIES.map((s) => ({
    value: s.id,
    label: s.label,
  }));
}
