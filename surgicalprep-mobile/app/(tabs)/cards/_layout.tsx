import { Stack } from 'expo-router';

export default function CardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: true,
          headerTitle: 'Card Details',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="new" 
        options={{ 
          headerShown: true,
          headerTitle: 'New Card',
          headerBackTitle: 'Cancel',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
