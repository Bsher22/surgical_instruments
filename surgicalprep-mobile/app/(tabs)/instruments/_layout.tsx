import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function InstrumentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: true,
          headerTitle: 'Instrument Details',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}
