import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isPremium: store.user?.subscription_tier === 'premium',
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    register: store.register,
  };
}

export function usePremiumStatus() {
  const { isPremium, user } = useAuth();
  
  return {
    isPremium,
    tier: user?.subscription_tier ?? 'free',
    expiresAt: user?.subscription_expires_at,
  };
}
