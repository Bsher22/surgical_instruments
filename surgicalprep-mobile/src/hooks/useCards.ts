/**
 * useCards Hook
 * React Query hooks for preference card operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../api/cards';
import type {
  PreferenceCard,
  PreferenceCardListItem,
  GetCardsParams,
  CreatePreferenceCardInput,
  UpdatePreferenceCardInput,
  PaginatedResponse,
} from '../types';

// Query keys for cache management
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (params: GetCardsParams) => [...cardKeys.lists(), params] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
  templates: () => [...cardKeys.all, 'templates'] as const,
};

/**
 * Fetch paginated list of user's cards
 */
export function useCards(params: GetCardsParams = {}) {
  return useQuery<PaginatedResponse<PreferenceCardListItem>, Error>({
    queryKey: cardKeys.list(params),
    queryFn: () => cardsApi.getCards(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch single card with all details
 */
export function useCard(id: string | undefined) {
  return useQuery<PreferenceCard, Error>({
    queryKey: cardKeys.detail(id!),
    queryFn: () => cardsApi.getCard(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch public template cards
 */
export function useTemplates() {
  return useQuery<PreferenceCardListItem[], Error>({
    queryKey: cardKeys.templates(),
    queryFn: () => cardsApi.getTemplates(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Create a new preference card
 */
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation<PreferenceCard, Error, CreatePreferenceCardInput>({
    mutationFn: (data) => cardsApi.createCard(data),
    onSuccess: () => {
      // Invalidate card lists to refetch with new card
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Update an existing preference card
 */
export function useUpdateCard(id: string) {
  const queryClient = useQueryClient();

  return useMutation<PreferenceCard, Error, UpdatePreferenceCardInput>({
    mutationFn: (data) => cardsApi.updateCard(id, data),
    onSuccess: (updatedCard) => {
      // Update the card in cache
      queryClient.setQueryData(cardKeys.detail(id), updatedCard);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Delete a preference card
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => cardsApi.deleteCard(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: cardKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Duplicate a preference card
 */
export function useDuplicateCard() {
  const queryClient = useQueryClient();

  return useMutation<PreferenceCard, Error, string>({
    mutationFn: (id) => cardsApi.duplicateCard(id),
    onSuccess: () => {
      // Invalidate lists to show new duplicate
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Upload a photo to a card
 */
export function useUploadCardPhoto(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ photo_url: string }, Error, FormData>({
    mutationFn: (formData) => cardsApi.uploadPhoto(cardId, formData),
    onSuccess: () => {
      // Refetch card to get updated photos
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

/**
 * Delete a photo from a card
 */
export function useDeleteCardPhoto(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (photoId) => cardsApi.deletePhoto(cardId, photoId),
    onSuccess: () => {
      // Refetch card to get updated photos
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

/**
 * Add an item to a card
 */
export function useAddCardItem(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: { 
      instrument_id?: string;
      item_name: string;
      quantity?: number;
      size?: string;
      notes?: string;
      category?: string;
    }) => cardsApi.addItem(cardId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

/**
 * Update an item on a card
 */
export function useUpdateCardItem(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { 
      itemId: string;
      data: {
        item_name?: string;
        quantity?: number;
        size?: string;
        notes?: string;
        category?: string;
        order_index?: number;
      };
    }) => cardsApi.updateItem(cardId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

/**
 * Delete an item from a card
 */
export function useDeleteCardItem(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (itemId) => cardsApi.deleteItem(cardId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

/**
 * Reorder items on a card
 */
export function useReorderCardItems(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => cardsApi.reorderItems(cardId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}
