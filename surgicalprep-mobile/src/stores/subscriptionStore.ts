/**
 * Zustand store for subscription state management
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionStatusResponse,
  SubscriptionPlanInfo,
  SubscriptionPlan,
  PremiumFeature,
} from '../types/subscription';
import {
  getSubscriptionStatus,
  getAvailablePlans,
} from '../api/subscriptions';

// ─────────────────────────────────────────────────────────────────────────────
// Store State Interface
// ─────────────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  // Subscription status
  status: SubscriptionStatusResponse | null;
  statusLastFetched: number | null;
  
  // Available plans
  plans: SubscriptionPlanInfo[];
  plansLastFetched: number | null;
  
  // Selected plan for checkout
  selectedPlan: SubscriptionPlan;
  
  // Loading states
  isLoadingStatus: boolean;
  isLoadingPlans: boolean;
  
  // Error states
  statusError: string | null;
  plansError: string | null;
  
  // Upgrade prompt modal
  showUpgradePrompt: boolean;
  upgradePromptFeature: PremiumFeature | null;
  
  // Actions
  fetchStatus: (force?: boolean) => Promise<void>;
  fetchPlans: (force?: boolean) => Promise<void>;
  setSelectedPlan: (plan: SubscriptionPlan) => void;
  updateStatus: (status: SubscriptionStatusResponse) => void;
  triggerUpgradePrompt: (feature: PremiumFeature) => void;
  dismissUpgradePrompt: () => void;
  clearErrors: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes for status, 1 hour for plans
const STATUS_CACHE_DURATION = 5 * 60 * 1000;
const PLANS_CACHE_DURATION = 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  status: null,
  statusLastFetched: null,
  plans: [],
  plansLastFetched: null,
  selectedPlan: 'annual' as SubscriptionPlan,
  isLoadingStatus: false,
  isLoadingPlans: false,
  statusError: null,
  plansError: null,
  showUpgradePrompt: false,
  upgradePromptFeature: null,
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchStatus: async (force = false) => {
        const { statusLastFetched, isLoadingStatus } = get();
        
        // Skip if already loading
        if (isLoadingStatus) return;
        
        // Skip if recently fetched (unless forced)
        if (
          !force &&
          statusLastFetched &&
          Date.now() - statusLastFetched < STATUS_CACHE_DURATION
        ) {
          return;
        }
        
        set({ isLoadingStatus: true, statusError: null });
        
        try {
          const status = await getSubscriptionStatus();
          set({
            status,
            statusLastFetched: Date.now(),
            isLoadingStatus: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch status';
          set({
            statusError: message,
            isLoadingStatus: false,
          });
        }
      },

      fetchPlans: async (force = false) => {
        const { plansLastFetched, isLoadingPlans } = get();
        
        // Skip if already loading
        if (isLoadingPlans) return;
        
        // Skip if recently fetched (unless forced)
        if (
          !force &&
          plansLastFetched &&
          Date.now() - plansLastFetched < PLANS_CACHE_DURATION
        ) {
          return;
        }
        
        set({ isLoadingPlans: true, plansError: null });
        
        try {
          const response = await getAvailablePlans();
          set({
            plans: response.plans,
            plansLastFetched: Date.now(),
            isLoadingPlans: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch plans';
          set({
            plansError: message,
            isLoadingPlans: false,
          });
        }
      },

      setSelectedPlan: (plan) => {
        set({ selectedPlan: plan });
      },

      updateStatus: (status) => {
        set({
          status,
          statusLastFetched: Date.now(),
        });
      },

      triggerUpgradePrompt: (feature) => {
        set({
          showUpgradePrompt: true,
          upgradePromptFeature: feature,
        });
      },

      dismissUpgradePrompt: () => {
        set({
          showUpgradePrompt: false,
          upgradePromptFeature: null,
        });
      },

      clearErrors: () => {
        set({
          statusError: null,
          plansError: null,
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'subscription-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist selected plan preference
        selectedPlan: state.selectedPlan,
      }),
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const selectIsPremium = (state: SubscriptionState): boolean => {
  return state.status?.can_access_premium ?? false;
};

export const selectTier = (state: SubscriptionState) => {
  return state.status?.tier ?? 'free';
};

export const selectCanCreateCard = (state: SubscriptionState): boolean => {
  const { status } = state;
  if (!status) return true; // Allow if status not loaded yet
  if (status.can_access_premium) return true;
  if (status.cards_limit === null) return true;
  return status.cards_used < status.cards_limit;
};

export const selectCanTakeQuiz = (state: SubscriptionState): boolean => {
  const { status } = state;
  if (!status) return true;
  if (status.can_access_premium) return true;
  if (status.quizzes_limit === null) return true;
  return status.quizzes_today < status.quizzes_limit;
};

export const selectUsagePercent = (
  current: number,
  limit: number | null
): number => {
  if (limit === null || limit === 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks for Common Selections
// ─────────────────────────────────────────────────────────────────────────────

export const useIsPremium = () => {
  return useSubscriptionStore(selectIsPremium);
};

export const useSubscriptionTier = () => {
  return useSubscriptionStore(selectTier);
};

export const useCanCreateCard = () => {
  return useSubscriptionStore(selectCanCreateCard);
};

export const useCanTakeQuiz = () => {
  return useSubscriptionStore(selectCanTakeQuiz);
};
