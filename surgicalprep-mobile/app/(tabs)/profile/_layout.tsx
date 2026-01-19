// app/(tabs)/profile/_layout.tsx
// Layout for profile tab with stack navigation

import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#6366F1',
        headerTitleStyle: {
          fontWeight: '600',
          color: '#111827',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: true,
        contentStyle: {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Profile screen has custom header
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerBackTitle: 'Profile',
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Change Password',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name="delete-account"
        options={{
          title: 'Delete Account',
          headerBackTitle: 'Settings',
          headerTintColor: '#EF4444',
        }}
      />
    </Stack>
  );
}
