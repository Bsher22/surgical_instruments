// src/services/analytics.ts
// Firebase Analytics setup and initialization

import * as Analytics from 'expo-firebase-analytics';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Check if analytics should be enabled
const isAnalyticsEnabled = (): boolean => {
  // Disable in development
  if (__DEV__) return false;
  
  // Disable if no Firebase config
  if (!Constants.expoConfig?.extra?.firebaseProjectId) return false;
  
  return true;
};

// Initialize analytics
export const initializeAnalytics = async (): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Disabled in development mode');
    return;
  }

  try {
    // Set user properties for segmentation
    await Analytics.setAnalyticsCollectionEnabled(true);
    console.log('[Analytics] Initialized successfully');
  } catch (error) {
    console.error('[Analytics] Initialization failed:', error);
  }
};

// Disable analytics (for user opt-out)
export const disableAnalytics = async (): Promise<void> => {
  try {
    await Analytics.setAnalyticsCollectionEnabled(false);
    console.log('[Analytics] Disabled');
  } catch (error) {
    console.error('[Analytics] Failed to disable:', error);
  }
};

// Set user ID for tracking across sessions
export const setUserId = async (userId: string | null): Promise<void> => {
  if (!isAnalyticsEnabled()) return;

  try {
    if (userId) {
      await Analytics.setUserId(userId);
    } else {
      await Analytics.setUserId(null);
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
};

// Set user properties for segmentation
export const setUserProperties = async (properties: {
  subscription_tier?: 'free' | 'premium';
  user_role?: string;
  institution?: string;
  cards_count?: number;
  instruments_studied?: number;
}): Promise<void> => {
  if (!isAnalyticsEnabled()) return;

  try {
    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined) {
        await Analytics.setUserProperty(key, String(value));
      }
    }
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
};

// Log custom event
export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    console.log(`[Analytics] Event (dev): ${eventName}`, params);
    return;
  }

  try {
    await Analytics.logEvent(eventName, params);
  } catch (error) {
    console.error(`[Analytics] Failed to log event ${eventName}:`, error);
  }
};

// Log screen view
export const logScreenView = async (
  screenName: string,
  screenClass?: string
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    console.log(`[Analytics] Screen view (dev): ${screenName}`);
    return;
  }

  try {
    await Analytics.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error(`[Analytics] Failed to log screen view:`, error);
  }
};

// Export analytics service object for easy importing
export const analytics = {
  initialize: initializeAnalytics,
  disable: disableAnalytics,
  setUserId,
  setUserProperties,
  logEvent,
  logScreenView,
};

export default analytics;
