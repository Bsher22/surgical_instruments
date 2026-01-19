import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Auth Layout
 * 
 * Wraps authentication screens (login, signup) with consistent styling
 * and navigation configuration. Uses a simple stack navigator with
 * no headers since auth screens have their own header UI.
 */
export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFB' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Sign In',
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            title: 'Create Account',
          }} 
        />
      </Stack>
    </>
  );
}
