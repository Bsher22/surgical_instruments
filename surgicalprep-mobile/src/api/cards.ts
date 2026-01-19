// src/api/cards.ts
// API functions for preference card operations

import { apiClient } from './client';
import type {
  PreferenceCard,
  CreateCardRequest,
  UpdateCardRequest,
  PaginatedResponse,
  CardsListParams,
} from '../types';

/**
 * Get paginated list of user's preference cards
 */
export async function getCards(
  params?: CardsListParams
): Promise<PaginatedResponse<PreferenceCard>> {
  const response = await apiClient.get<PaginatedResponse<PreferenceCard>>(
    '/api/v1/preference-cards',
    { params }
  );
  return response.data;
}

/**
 * Get a single preference card by ID
 */
export async function getCard(id: string): Promise<PreferenceCard> {
  const response = await apiClient.get<PreferenceCard>(
    `/api/v1/preference-cards/${id}`
  );
  return response.data;
}

/**
 * Create a new preference card
 */
export async function createCard(
  data: CreateCardRequest
): Promise<PreferenceCard> {
  const response = await apiClient.post<PreferenceCard>(
    '/api/v1/preference-cards',
    data
  );
  return response.data;
}

/**
 * Update an existing preference card
 */
export async function updateCard(
  id: string,
  data: UpdateCardRequest
): Promise<PreferenceCard> {
  const response = await apiClient.put<PreferenceCard>(
    `/api/v1/preference-cards/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete a preference card
 */
export async function deleteCard(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/preference-cards/${id}`);
}

/**
 * Duplicate a preference card
 */
export async function duplicateCard(id: string): Promise<PreferenceCard> {
  const response = await apiClient.post<PreferenceCard>(
    `/api/v1/preference-cards/${id}/duplicate`
  );
  return response.data;
}

/**
 * Get public template cards
 */
export async function getTemplateCards(): Promise<PreferenceCard[]> {
  const response = await apiClient.get<PreferenceCard[]>(
    '/api/v1/preference-cards/templates'
  );
  return response.data;
}

/**
 * Create card from template
 */
export async function createCardFromTemplate(
  templateId: string
): Promise<PreferenceCard> {
  const response = await apiClient.post<PreferenceCard>(
    `/api/v1/preference-cards/templates/${templateId}/create`
  );
  return response.data;
}
