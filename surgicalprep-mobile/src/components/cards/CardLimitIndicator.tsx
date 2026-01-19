import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserCardLimits } from '../../types/cards';

interface CardLimitIndicatorProps {
  limits: UserCardLimits;
}

export function CardLimitIndicator({ limits }: CardLimitIndicatorProps) {
  const router = useRouter();
  const { used, max, is_premium } = limits;

  // Don't show for premium users
  if (is_premium) {
    return null;
  }

  const percentage = (used / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= max;

  const handleUpgradePress = () => {
    // Navigate to subscription/upgrade screen
    router.push('/profile/upgrade');
  };

  return (
    <View style={[styles.container, isAtLimit && styles.containerWarning]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Ionicons
              name={isAtLimit ? 'warning' : 'documents-outline'}
              size={16}
              color={isAtLimit ? '#dc3545' : '#666'}
            />
            <Text style={[styles.label, isAtLimit && styles.labelWarning]}>
              {isAtLimit ? 'Card limit reached' : 'Cards used'}
            </Text>
          </View>
          <Text style={[styles.count, isAtLimit && styles.countWarning]}>
            {used} / {max}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
                isNearLimit && styles.progressFillWarning,
                isAtLimit && styles.progressFillDanger,
              ]}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.upgradeButton, isAtLimit && styles.upgradeButtonPrimary]}
        onPress={handleUpgradePress}
      >
        <Ionicons
          name="sparkles"
          size={14}
          color={isAtLimit ? '#fff' : '#4a90d9'}
        />
        <Text
          style={[
            styles.upgradeText,
            isAtLimit && styles.upgradeTextPrimary,
          ]}
        >
          {isAtLimit ? 'Upgrade' : 'Go Premium'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Compact version for use in headers or smaller spaces
export function CardLimitIndicatorCompact({ limits }: CardLimitIndicatorProps) {
  const { used, max, is_premium } = limits;

  if (is_premium) {
    return null;
  }

  const isAtLimit = used >= max;

  return (
    <View style={[styles.compactContainer, isAtLimit && styles.compactWarning]}>
      <Ionicons
        name="documents-outline"
        size={12}
        color={isAtLimit ? '#dc3545' : '#666'}
      />
      <Text style={[styles.compactText, isAtLimit && styles.compactTextWarning]}>
        {used}/{max} cards
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  containerWarning: {
    backgroundColor: '#fff5f5',
    borderBottomColor: '#ffcccc',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  labelWarning: {
    color: '#dc3545',
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  countWarning: {
    color: '#dc3545',
  },
  progressContainer: {
    height: 4,
  },
  progressBackground: {
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90d9',
    borderRadius: 2,
  },
  progressFillWarning: {
    backgroundColor: '#ffc107',
  },
  progressFillDanger: {
    backgroundColor: '#dc3545',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  upgradeButtonPrimary: {
    backgroundColor: '#4a90d9',
    borderColor: '#4a90d9',
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a90d9',
  },
  upgradeTextPrimary: {
    color: '#fff',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  compactWarning: {
    backgroundColor: '#ffecec',
  },
  compactText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  compactTextWarning: {
    color: '#dc3545',
  },
});

export default CardLimitIndicator;
