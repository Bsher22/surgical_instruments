// src/components/profile/SettingsSection.tsx
// Reusable section wrapper for settings screens

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
});

export default SettingsSection;
