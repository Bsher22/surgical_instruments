// src/api/index.ts
// Barrel exports for API layer

// Client
export { getApiClient, api, tokenStorage } from './client';

// Query client
export {
  getQueryClient,
  createQueryClient,
  queryKeys,
  defaultQueryOptions,
  CACHE_TIMES,
  prefetchQueries,
  invalidateRelatedQueries,
} from './queryClient';

// Error handling
export {
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
  parseValidationErrors,
  getErrorMessage,
  isRetryableError,
  isAuthError,
  isPremiumRequired,
} from './errorInterceptor';
export type { ApiError, ValidationError } from './errorInterceptor';
