// app/_layout.tsx
// Root layout with monitoring and analytics integration
// This shows how to integrate Stage 12 monitoring into your app

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Monitoring imports
import { sentry, analytics } from '@/services';
import {
  useAnalyticsInit,
  useScreenTracking,
  useUserIdentity,
} from '@/hooks/useAnalytics';
import {
  MedicalDisclaimerModal,
  checkDisclaimerAccepted,
} from '@/components/MedicalDisclaimer';

// Auth store
import { useAuthStore } from '@/stores/authStore';

// Wrap the entire app with Sentry for crash reporting
const App = sentry.wrap(function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
      },
    },
  }));

  // Check if medical disclaimer needs to be shown
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Get current user from auth store
  const user = useAuthStore((state) => state.user);

  // Initialize analytics and screen tracking
  useAnalyticsInit();
  useScreenTracking();
  
  // Set user identity for analytics and error tracking
  useUserIdentity(user ? {
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    subscription_tier: user.subscription_tier,
    institution: user.institution,
  } : null);

  // Check disclaimer acceptance on mount
  useEffect(() => {
    const checkDisclaimer = async () => {
      const accepted = await checkDisclaimerAccepted();
      if (!accepted) {
        setShowDisclaimer(true);
      }
      setDisclaimerChecked(true);
    };
    checkDisclaimer();
  }, []);

  // Don't render until disclaimer check is complete
  if (!disclaimerChecked) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* Medical Disclaimer Modal - shows on first launch */}
          {showDisclaimer && (
            <MedicalDisclaimerModal
              required={true}
              onAccept={() => setShowDisclaimer(false)}
            />
          )}

          {/* Main App Navigation */}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>

          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

export default App;
