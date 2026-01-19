/**
 * Hook for subscription status and management
 */
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';
import {
  useSubscriptionStore,
  useIsPremium,
  useSubscriptionTier,
} from '../stores/subscriptionStore';
import {
  useSubscriptionStatus,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useRestorePurchases,
  subscriptionKeys,
} from '../api/subscriptions';
import { SubscriptionPlan } from '../types/subscription';
import { DEEP_LINKS } from '../constants/subscription';

// ─────────────────────────────────────────────────────────────────────────────
// Main Subscription Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const queryClient = useQueryClient();
  
  // Store state
  const {
    selectedPlan,
    setSelectedPlan,
    showUpgradePrompt,
    upgradePromptFeature,
    dismissUpgradePrompt,
    updateStatus,
  } = useSubscriptionStore();
  
  // Queries
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useSubscriptionStatus();
  
  // Mutations
  const checkoutMutation = useCreateCheckoutSession();
  const portalMutation = useCreatePortalSession();
  const restoreMutation = useRestorePurchases();
  
  // Selectors
  const isPremium = useIsPremium();
  const tier = useSubscriptionTier();
  
  // Update store when status changes
  useEffect(() => {
    if (status) {
      updateStatus(status);
    }
  }, [status, updateStatus]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Checkout Flow
  // ─────────────────────────────────────────────────────────────────────────
  
  const startCheckout = useCallback(async (plan?: SubscriptionPlan) => {
    const planToUse = plan || selectedPlan;
    
    try {
      const { checkout_url } = await checkoutMutation.mutateAsync({
        plan: planToUse,
        success_url: DEEP_LINKS.subscriptionSuccess,
        cancel_url: DEEP_LINKS.subscriptionCancel,
      });
      
      // Open Stripe checkout in browser
      const result = await WebBrowser.openBrowserAsync(checkout_url, {
        dismissButtonStyle: 'cancel',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
      
      // Refresh status after returning
      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed browser, refresh to check if payment completed
        await refetchStatus();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Error',
        'Unable to start checkout. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [selectedPlan, checkoutMutation, refetchStatus]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Customer Portal
  // ─────────────────────────────────────────────────────────────────────────
  
  const openPortal = useCallback(async () => {
    try {
      const { portal_url } = await portalMutation.mutateAsync({
        return_url: DEEP_LINKS.subscriptionReturn,
      });
      
      await WebBrowser.openBrowserAsync(portal_url, {
        dismissButtonStyle: 'done',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
      
      // Refresh status after returning
      await refetchStatus();
    } catch (error) {
      console.error('Portal error:', error);
      Alert.alert(
        'Error',
        'Unable to open subscription management. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [portalMutation, refetchStatus]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Restore Purchases
  // ─────────────────────────────────────────────────────────────────────────
  
  const restorePurchases = useCallback(async () => {
    try {
      const result = await restoreMutation.mutateAsync({});
      
      if (result.found) {
        Alert.alert(
          'Purchases Restored',
          'Your premium subscription has been restored.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Error',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [restoreMutation]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Refresh
  // ─────────────────────────────────────────────────────────────────────────
  
  const refreshSubscription = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    await refetchStatus();
  }, [queryClient, refetchStatus]);
  
  return {
    // Status
    status,
    isLoadingStatus,
    statusError,
    isPremium,
    tier,
    
    // Plan selection
    selectedPlan,
    setSelectedPlan,
    
    // Actions
    startCheckout,
    openPortal,
    restorePurchases,
    refreshSubscription,
    
    // Loading states
    isCheckingOut: checkoutMutation.isPending,
    isOpeningPortal: portalMutation.isPending,
    isRestoringPurchases: restoreMutation.isPending,
    
    // Upgrade prompt
    showUpgradePrompt,
    upgradePromptFeature,
    dismissUpgradePrompt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Deep Link Handler Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSubscriptionDeepLinks() {
  const { refreshSubscription } = useSubscription();
  
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      
      if (url.includes('subscription/success')) {
        // Payment successful - refresh status
        await refreshSubscription();
        Alert.alert(
          'Welcome to Premium!',
          'Your subscription is now active. Enjoy unlimited access!',
          [{ text: 'Get Started' }]
        );
      } else if (url.includes('subscription/cancel')) {
        // Payment cancelled - just refresh in case
        await refreshSubscription();
      }
    };
    
    // Add listener for when app is opened via deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [refreshSubscription]);
}

export default useSubscription;
