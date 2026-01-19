// ============================================================================
// Quiz Tab Layout
// ============================================================================

import { Stack } from 'expo-router';
import { colors, typography } from '../../../src/utils/theme';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: typography.weights.semibold,
          fontSize: typography.sizes.lg,
          color: colors.text,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Study',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="flashcards"
        options={{
          title: 'Flashcards',
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="session"
        options={{
          title: 'Quiz',
          presentation: 'fullScreenModal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Results',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Quiz History',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
