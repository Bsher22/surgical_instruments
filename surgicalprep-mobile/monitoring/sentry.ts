// src/services/sentry.ts
// Sentry error monitoring setup and configuration

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Configuration
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn;
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const APP_VARIANT = Constants.expoConfig?.extra?.appVariant || 'production';

// Check if Sentry should be enabled
const isSentryEnabled = (): boolean => {
  // Disable in development
  if (__DEV__) return false;
  
  // Disable if no DSN configured
  if (!SENTRY_DSN) return false;
  
  return true;
};

/**
 * Initialize Sentry
 * Call this early in your app's entry point (app/_layout.tsx)
 */
export const initializeSentry = (): void => {
  if (!isSentryEnabled()) {
    console.log('[Sentry] Disabled in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      
      // Enable performance monitoring
      enableAutoPerformanceTracing: true,
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // Reduce in production to lower costs
      tracesSampleRate: APP_VARIANT === 'production' ? 0.2 : 1.0,
      
      // Enable automatic session tracking
      enableAutoSessionTracking: true,
      
      // Session tracking interval (ms)
      sessionTrackingIntervalMillis: 30000,
      
      // Release version
      release: `surgicalprep@${APP_VERSION}`,
      
      // Environment
      environment: APP_VARIANT,
      
      // Filter events before sending
      beforeSend: (event, hint) => {
        // Don't send events in development
        if (__DEV__) return null;
        
        // Optionally filter out specific errors
        const error = hint?.originalException;
        if (error instanceof Error) {
          // Example: Filter out network timeout errors
          if (error.message?.includes('Network request failed')) {
            // You might want to log these differently
            return null;
          }
        }
        
        return event;
      },
      
      // Configure which breadcrumbs to collect
      beforeBreadcrumb: (breadcrumb) => {
        // Filter sensitive data from breadcrumbs
        if (breadcrumb.category === 'console') {
          // Don't track console logs in production
          return APP_VARIANT === 'production' ? null : breadcrumb;
        }
        return breadcrumb;
      },
      
      // Enable native crash handling
      enableNativeCrashHandling: true,
      
      // Maximum breadcrumbs to keep
      maxBreadcrumbs: 100,
      
      // Attach stack traces to messages
      attachStacktrace: true,
      
      // Debug mode (disable in production)
      debug: APP_VARIANT !== 'production',
    });

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
};

/**
 * Set user information for error tracking
 */
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
  subscription_tier?: string;
} | null): void => {
  if (!isSentryEnabled()) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      // Add custom data
      subscription_tier: user.subscription_tier,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Set additional context for errors
 */
export const setContext = (
  name: string,
  context: Record<string, unknown>
): void => {
  if (!isSentryEnabled()) return;
  Sentry.setContext(name, context);
};

/**
 * Add a breadcrumb for debugging
 */
export const addBreadcrumb = (breadcrumb: {
  category?: string;
  message: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}): void => {
  if (!isSentryEnabled()) return;

  Sentry.addBreadcrumb({
    category: breadcrumb.category || 'app',
    message: breadcrumb.message,
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
  });
};

/**
 * Capture an exception
 */
export const captureException = (
  error: Error | unknown,
  context?: Record<string, unknown>
): string | undefined => {
  if (!isSentryEnabled()) {
    console.error('[Sentry] Exception (dev):', error);
    return undefined;
  }

  return Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string | undefined => {
  if (!isSentryEnabled()) {
    console.log(`[Sentry] Message (dev) [${level}]:`, message);
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Set a tag for filtering
 */
export const setTag = (key: string, value: string): void => {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
};

/**
 * Start a performance transaction
 */
export const startTransaction = (
  name: string,
  op: string
): Sentry.Transaction | null => {
  if (!isSentryEnabled()) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Wrap a component with Sentry error boundary
 */
export const withErrorBoundary = Sentry.withErrorBoundary;

/**
 * Native crash handler wrapper
 */
export const wrap = Sentry.wrap;

// Export Sentry types for consumers
export type { SeverityLevel } from '@sentry/react-native';

// Export the entire Sentry namespace for advanced usage
export { Sentry };

// Export a convenient object for common operations
export const sentry = {
  initialize: initializeSentry,
  setUser,
  setContext,
  setTag,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  withErrorBoundary,
  wrap,
};

export default sentry;
