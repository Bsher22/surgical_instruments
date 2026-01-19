import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface FormErrorProps {
  message: string;
  style?: ViewStyle;
}

/**
 * FormError Component
 *
 * Displays form validation error messages with consistent styling.
 * Can be used inline below form fields or as a general error banner.
 */
export function FormError({ message, style }: FormErrorProps) {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  icon: {
    fontSize: 12,
    marginRight: 6,
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
  },
});
