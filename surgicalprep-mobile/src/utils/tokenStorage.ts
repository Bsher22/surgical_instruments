// src/utils/tokenStorage.ts
// Secure token storage using expo-secure-store

import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from '../types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'surgicalprep_access_token',
  REFRESH_TOKEN: 'surgicalprep_refresh_token',
  TOKEN_EXPIRY: 'surgicalprep_token_expiry',
} as const;

/**
 * Store authentication tokens securely
 */
export async function storeTokens(tokens: AuthTokens): Promise<void> {
  try {
    // Calculate expiry timestamp (current time + expires_in seconds)
    const expiryTimestamp = Date.now() + tokens.expires_in * 1000;

    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token),
      SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp.toString()),
    ]);
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to securely store authentication tokens');
  }
}

/**
 * Retrieve stored tokens
 * Returns null if no tokens are stored
 */
export async function getStoredTokens(): Promise<AuthTokens | null> {
  try {
    const [accessToken, refreshToken, expiryStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    const expiry = expiryStr ? parseInt(expiryStr, 10) : 0;
    const remainingSeconds = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: remainingSeconds,
    };
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
}

/**
 * Get just the access token (for API requests)
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Get just the refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
}

/**
 * Update only the access token (after refresh)
 */
export async function updateAccessToken(
  accessToken: string,
  expiresIn: number
): Promise<void> {
  try {
    const expiryTimestamp = Date.now() + expiresIn * 1000;
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp.toString()),
    ]);
  } catch (error) {
    console.error('Failed to update access token:', error);
    throw new Error('Failed to update access token');
  }
}

/**
 * Check if the access token is expired or about to expire
 * Returns true if token expires within the buffer time (default 60 seconds)
 */
export async function isTokenExpired(bufferSeconds: number = 60): Promise<boolean> {
  try {
    const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryStr) {
      return true;
    }

    const expiry = parseInt(expiryStr, 10);
    const bufferMs = bufferSeconds * 1000;

    return Date.now() >= expiry - bufferMs;
  } catch (error) {
    console.error('Failed to check token expiry:', error);
    return true; // Assume expired on error
  }
}

/**
 * Clear all stored tokens (for logout)
 */
export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
    // Don't throw - clearing tokens should be best-effort
  }
}

/**
 * Check if tokens exist in storage
 */
export async function hasStoredTokens(): Promise<boolean> {
  try {
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    return !!(accessToken && refreshToken);
  } catch (error) {
    console.error('Failed to check for stored tokens:', error);
    return false;
  }
}
