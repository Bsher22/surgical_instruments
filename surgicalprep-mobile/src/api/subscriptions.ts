/**
 * Subscription API client functions
 */
import { apiClient } from './client';
import {
  CreateCheckoutSessionRequest,
  CreatePortalSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse,
  SubscriptionStatusResponse,
  AvailablePlansResponse,
  RestorePurchasesRequest,
  RestorePurchasesResponse,
  FeatureAccessResponse,
  PremiumFeature,
} from '../types/subscription';

const SUBSCRIPTIONS_BASE = '/api/subscriptions';

// ─────────────────────────────────────────────────────────────────────────────
// Checkout & Portal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a Stripe checkout session for subscription purchase
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<CheckoutSessionResponse>(
    `${SUBSCRIPTIONS_BASE}/create-checkout`,
    request
  );
  return response.data;
}

/**
 * Create a Stripe customer portal session for subscription management
 */
export async function createPortalSession(
  request?: CreatePortalSessionRequest
): Promise<PortalSessionResponse> {
  const response = await apiClient.post<PortalSessionResponse>(
    `${SUBSCRIPTIONS_BASE}/portal`,
    request || {}
  );
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status & Plans
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const response = await apiClient.get<SubscriptionStatusResponse>(
    `${SUBSCRIPTIONS_BASE}/status`
  );
  return response.data;
}

/**
 * Get available subscription plans
 */
export async function getAvailablePlans(): Promise<AvailablePlansResponse> {
  const response = await apiClient.get<AvailablePlansResponse>(
    `${SUBSCRIPTIONS_BASE}/plans`
  );
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  feature: PremiumFeature
): Promise<FeatureAccessResponse> {
  const response = await apiClient.get<FeatureAccessResponse>(
    `${SUBSCRIPTIONS_BASE}/check-access/${feature}`
  );
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Restore Purchases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempt to restore previous purchases
 */
export async function restorePurchases(
  request?: RestorePurchasesRequest
): Promise<RestorePurchasesResponse> {
  const response = await apiClient.post<RestorePurchasesResponse>(
    `${SUBSCRIPTIONS_BASE}/restore`,
    request || {}
  );
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// React Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ['subscription'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  featureAccess: (feature: PremiumFeature) =>
    [...subscriptionKeys.all, 'feature', feature] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// React Query Hook Options
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook to fetch subscription status
 */
export function useSubscriptionStatus(
  options?: Omit<UseQueryOptions<SubscriptionStatusResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: getSubscriptionStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch available plans
 */
export function useAvailablePlans(
  options?: Omit<UseQueryOptions<AvailablePlansResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: getAvailablePlans,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(
  feature: PremiumFeature,
  options?: Omit<UseQueryOptions<FeatureAccessResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subscriptionKeys.featureAccess(feature),
    queryFn: () => checkFeatureAccess(feature),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to create checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
  });
}

/**
 * Hook to create portal session
 */
export function useCreatePortalSession() {
  return useMutation({
    mutationFn: createPortalSession,
  });
}

/**
 * Hook to restore purchases
 */
export function useRestorePurchases() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restorePurchases,
    onSuccess: (data) => {
      if (data.found && data.subscription_status) {
        // Update cached status
        queryClient.setQueryData(
          subscriptionKeys.status(),
          data.subscription_status
        );
      }
    },
  });
}

/**
 * Hook to invalidate subscription data
 */
export function useRefreshSubscription() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  };
}
