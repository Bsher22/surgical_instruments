// src/types/auth.ts
// Authentication-related TypeScript types

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 
  | 'surgical_tech'
  | 'nurse'
  | 'student'
  | 'educator'
  | 'other';

export type SubscriptionTier = 'free' | 'premium';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds until access token expires
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // true after initial auth check completes
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  institution?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// API Error response type
export interface AuthError {
  detail: string;
  status_code?: number;
}
