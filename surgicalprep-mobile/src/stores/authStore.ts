import { create } from 'zustand';
import { Platform } from 'react-native';

// Platform-aware storage helper
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    // Only require expo-secure-store on native platforms
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    // Only require expo-secure-store on native platforms
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail on error
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    // Only require expo-secure-store on native platforms
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail on error
    }
  },
};

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  institution: string | null;
  subscription_tier: 'free' | 'premium';
  subscription_expires_at: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  institution?: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      // const response = await api.auth.login({ email, password });
      // await secureStorage.setItem(TOKEN_KEY, response.token);
      // set({ user: response.user, token: response.token, isAuthenticated: true });

      // Placeholder for now
      throw new Error('Not implemented - use actual API');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await secureStorage.deleteItem(TOKEN_KEY);
    await secureStorage.deleteItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      throw new Error('Not implemented - use actual API');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.getItem(TOKEN_KEY);
      const userJson = await secureStorage.getItem(USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Alias for checkAuth - used by _layout.tsx
  checkAuthStatus: async () => {
    const { checkAuth } = useAuthStore.getState();
    await checkAuth();
  },

  setUser: (user: User) => {
    set({ user });
    secureStorage.setItem(USER_KEY, JSON.stringify(user));
  },
}));
