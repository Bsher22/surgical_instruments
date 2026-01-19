// src/components/profile/UsageStatsCard.tsx
// Usage statistics card with animated counters

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserStats } from '../../types/user';

interface UsageStatsCardProps {
  stats: UserStats;
  isLoading?: boolean;
}

export const UsageStatsCard: React.FC<UsageStatsCardProps> = ({
  stats,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={20} color="#6366F1" />
        <Text style={styles.headerText}>Your Stats</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <StatItem
          icon="albums"
          iconColor="#6366F1"
          value={stats.cards_created}
          label="Cards"
          limit={stats.cards_limit}
          isLoading={isLoading}
        />
        <StatItem
          icon="medical"
          iconColor="#10B981"
          value={stats.instruments_studied}
          label="Instruments"
          total={stats.instruments_total}
          isLoading={isLoading}
        />
        <StatItem
          icon="checkmark-circle"
          iconColor="#F59E0B"
          value={stats.quizzes_completed}
          label="Quizzes"
          isLoading={isLoading}
        />
        <StatItem
          icon="flame"
          iconColor="#EF4444"
          value={stats.current_streak}
          label="Day Streak"
          highlight={stats.current_streak >= 7}
          isLoading={isLoading}
        />
      </View>
      
      {/* Additional Stats Row */}
      <View style={styles.additionalStats}>
        {stats.average_quiz_score !== null && (
          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatValue}>
              {Math.round(stats.average_quiz_score)}%
            </Text>
            <Text style={styles.additionalStatLabel}>Avg Score</Text>
          </View>
        )}
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatValue}>
            {formatStudyTime(stats.total_study_time_minutes)}
          </Text>
          <Text style={styles.additionalStatLabel}>Study Time</Text>
        </View>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatValue}>
            {stats.instruments_due_for_review}
          </Text>
          <Text style={styles.additionalStatLabel}>Due Review</Text>
        </View>
      </View>
    </View>
  );
};

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: number;
  label: string;
  limit?: number | null;
  total?: number;
  highlight?: boolean;
  isLoading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  iconColor,
  value,
  label,
  limit,
  total,
  highlight = false,
  isLoading = false,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  
  useEffect(() => {
    if (!isLoading && value > 0) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [value, isLoading]);
  
  // For non-animated display, just use the value directly
  const displayNumber = isLoading ? '-' : value.toString();
  
  const subtext = limit !== undefined && limit !== null
    ? `/ ${limit}`
    : total !== undefined
    ? `/ ${total}`
    : null;
  
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <View style={styles.statValueRow}>
          <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
            {displayNumber}
          </Text>
          {subtext && (
            <Text style={styles.statSubtext}>{subtext}</Text>
          )}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      {highlight && (
        <View style={styles.highlightBadge}>
          <Ionicons name="flame" size={10} color="#FFF" />
        </View>
      )}
    </View>
  );
};

const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    position: 'relative',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    gap: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statValueHighlight: {
    color: '#EF4444',
  },
  statSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  highlightBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  additionalStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  additionalStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default UsageStatsCard;
