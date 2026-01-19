// src/components/ui/FormSection.tsx
// Section wrapper component with title for grouping form fields

import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  containerStyle?: object;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = memo(
  ({
    title,
    description,
    icon,
    children,
    containerStyle,
  }) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {/* Section Header */}
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color="#2563EB" />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
        </View>

        {/* Section Content */}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }
);

FormSection.displayName = 'FormSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 20,
  },
  content: {
    // Children will have their own margins
  },
});

export default FormSection;
