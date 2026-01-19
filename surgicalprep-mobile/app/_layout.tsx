// app/_layout.tsx
// Root layout with all Stage 10 polish integrations

import React, { useEffect } from 'react';
import { StyleSheet, View, LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// API & State
import { getQueryClient } from '../src/api/queryClient';
import { useAuthStore } from '../src/stores/authStore';

// Components
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { ToastContainer } from '../src/components/ui/ToastContainer';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { FullScreenLoader } from '../src/components/ui/LoadingSpinner';

// Theme
import { theme } from '../src/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Ignore specific logs in development (optional)
if (__DEV__) {
  LogBox.ignoreLogs([
    'ViewPropTypes will be removed',
    'ColorPropType will be removed',
  ]);
}

// Get query client instance
const queryClient = getQueryClient();

export default function RootLayout() {
  const { isLoading, isAuthenticated, checkAuthStatus } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        // Hide splash screen after auth check
        await SplashScreen.hideAsync();
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <FullScreenLoader visible message="Loading..." />
      </View>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error monitoring service
        console.error('[ErrorBoundary]', error, errorInfo);
        // TODO: Sentry.captureException(error)
      }}
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            {/* Status bar */}
            <StatusBar style="dark" />
            
            {/* Offline banner - shows when network is unavailable */}
            <OfflineBanner />
            
            {/* Toast notifications container */}
            <ToastContainer />
            
            {/* Navigation stack */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'slide_from_right',
              }}
            >
              {/* Auth screens */}
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />
              
              {/* Main app tabs */}
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              
              {/* Index redirect */}
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
