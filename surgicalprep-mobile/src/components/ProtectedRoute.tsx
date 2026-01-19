// src/components/ProtectedRoute.tsx
// Protected route wrapper component for authenticated screens

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth, useAuthInitializer } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional: Require premium subscription to access
   */
  requirePremium?: boolean;
  /**
   * Optional: Custom fallback component while loading
   */
  loadingComponent?: React.ReactNode;
  /**
   * Optional: Custom redirect path for unauthenticated users
   */
  redirectTo?: string;
  /**
   * Optional: Redirect path for non-premium users (if requirePremium is true)
   */
  premiumRedirectTo?: string;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <MyProtectedScreen />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requirePremium = false,
  loadingComponent,
  redirectTo = '/login',
  premiumRedirectTo = '/subscription',
}: ProtectedRouteProps): React.ReactElement {
  // Initialize auth on mount
  useAuthInitializer();

  const { isAuthenticated, isInitialized, isLoading, isPremium } = useAuth();

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href={redirectTo} />;
  }

  // Check premium requirement
  if (requirePremium && !isPremium) {
    return <Redirect href={premiumRedirectTo} />;
  }

  // User is authenticated (and premium if required)
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * Usage:
 * ```tsx
 * export default withProtectedRoute(MyScreen);
 * // or with options:
 * export default withProtectedRoute(MyScreen, { requirePremium: true });
 * ```
 */
export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
): React.FC<P> {
  const WithProtectedRoute: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  // Set display name for debugging
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithProtectedRoute.displayName = `withProtectedRoute(${displayName})`;

  return WithProtectedRoute;
}

/**
 * AuthGuard Component
 *
 * Alternative component that renders different content based on auth state.
 * Useful for conditional rendering without redirects.
 *
 * Usage:
 * ```tsx
 * <AuthGuard
 *   authenticated={<ProtectedContent />}
 *   unauthenticated={<LoginPrompt />}
 * />
 * ```
 */
interface AuthGuardProps {
  authenticated: React.ReactNode;
  unauthenticated: React.ReactNode;
  loading?: React.ReactNode;
}

export function AuthGuard({
  authenticated,
  unauthenticated,
  loading,
}: AuthGuardProps): React.ReactElement {
  useAuthInitializer();

  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    if (loading) {
      return <>{loading}</>;
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <>{isAuthenticated ? authenticated : unauthenticated}</>;
}

/**
 * PremiumGuard Component
 *
 * Renders different content based on premium status.
 *
 * Usage:
 * ```tsx
 * <PremiumGuard
 *   premium={<FullContent />}
 *   free={<LimitedContent />}
 * />
 * ```
 */
interface PremiumGuardProps {
  premium: React.ReactNode;
  free: React.ReactNode;
  loading?: React.ReactNode;
}

export function PremiumGuard({
  premium,
  free,
  loading,
}: PremiumGuardProps): React.ReactElement {
  useAuthInitializer();

  const { isInitialized, isLoading, isPremium, isAuthenticated } = useAuth();

  if (!isInitialized || isLoading) {
    if (loading) {
      return <>{loading}</>;
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Must be authenticated to check premium status
  if (!isAuthenticated) {
    return <>{free}</>;
  }

  return <>{isPremium ? premium : free}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ProtectedRoute;
