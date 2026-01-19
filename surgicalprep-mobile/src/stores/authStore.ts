import { create } from 'zustand';
import { Platform } from 'react-native';
import axios from 'axios';

// API base URL - ensure it has a protocol
const getApiBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  // If URL doesn't start with http:// or https://, add https://
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};
const API_BASE_URL = getApiBaseUrl();

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
  refreshToken: string | null;
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
  fetchUserProfile: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  institution?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      await secureStorage.setItem(TOKEN_KEY, access_token);
      await secureStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

      set({
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Fetch user profile
      await get().fetchUserProfile();

    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await secureStorage.deleteItem(TOKEN_KEY);
    await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
    await secureStorage.deleteItem(USER_KEY);
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/auth/signup`, {
        email: data.email,
        password: data.password,
        full_name: data.name,
        role: data.role,
        institution: data.institution || null,
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      await secureStorage.setItem(TOKEN_KEY, access_token);
      await secureStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

      set({
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Fetch user profile
      await get().fetchUserProfile();

    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchUserProfile: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.name,
        role: userData.role,
        institution: userData.institution,
        subscription_tier: userData.subscription_tier || 'free',
        subscription_expires_at: userData.subscription_expires_at,
      };

      await secureStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't throw - user can still use the app with tokens
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.getItem(TOKEN_KEY);
      const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
      const userJson = await secureStorage.getItem(USER_KEY);

      if (token) {
        let user: User | null = null;
        if (userJson) {
          user = JSON.parse(userJson) as User;
        }
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        });

        // Try to refresh user profile in background
        if (token) {
          get().fetchUserProfile().catch(() => {});
        }
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
