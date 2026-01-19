// app/(tabs)/profile/index.tsx
// Main profile screen with user info, subscription, and stats

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  ProfileHeader,
  SubscriptionCard,
  UsageStatsCard,
  EditProfileModal,
} from '../../../src/components/profile';
import {
  useProfileData,
  useUpdateProfile,
} from '../../../src/hooks/useUser';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import type { UpdateProfileRequest, UserStats } from '../../../src/types/user';

// Loading skeleton component
const ProfileSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonName} />
      <View style={styles.skeletonEmail} />
      <View style={styles.skeletonBadge} />
    </View>
    <View style={styles.skeletonCard} />
    <View style={styles.skeletonStats} />
  </View>
);

// Error state component
const ProfileError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="warning-outline" size={48} color="#EF4444" />
    <Text style={styles.errorTitle}>Failed to load profile</Text>
    <Text style={styles.errorMessage}>
      Please check your connection and try again
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

export default function ProfileScreen() {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { profile, stats, subscription, isLoading, isError, refetch } = useProfileData();
  const updateProfile = useUpdateProfile();
  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);
  
  const handleSettingsPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/profile/settings');
  };
  
  const handleEditPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditModalVisible(true);
  };
  
  const handleUpgradePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to paywall (Stage 8)
    // router.push('/paywall');
    Alert.alert('Coming Soon', 'Premium subscriptions will be available soon!');
  };
  
  const handleManageSubscription = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Open Stripe customer portal (Stage 8)
    Alert.alert('Manage Subscription', 'Subscription management will be available soon!');
  };
  
  const handleSaveProfile = async (data: UpdateProfileRequest) => {
    await updateProfile.mutateAsync(data);
  };
  
  const handleHelpPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Open help/support
    Alert.alert('Help & Support', 'Contact us at support@surgicalprep.app');
  };
  
  // Default stats for loading state
  const defaultStats: UserStats = {
    cards_created: 0,
    cards_limit: 5,
    instruments_studied: 0,
    instruments_total: 0,
    quizzes_completed: 0,
    flashcard_sessions_completed: 0,
    average_quiz_score: null,
    current_streak: 0,
    longest_streak: 0,
    total_study_time_minutes: 0,
    last_study_date: null,
    instruments_due_for_review: 0,
  };
  
  if (isError && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileError onRetry={handleRefresh} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>
      
      {isLoading && !profile ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6366F1"
            />
          }
        >
          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            onEditPress={handleEditPress}
          />
          
          {/* Subscription Card */}
          <SubscriptionCard
            tier={subscription?.tier || profile.subscription_tier}
            expiresAt={subscription?.expires_at || profile.subscription_expires_at}
            cancelled={subscription?.cancelled || profile.subscription_cancelled}
            onUpgradePress={handleUpgradePress}
            onManagePress={handleManageSubscription}
          />
          
          {/* Usage Stats */}
          <UsageStatsCard
            stats={stats || defaultStats}
            isLoading={!stats}
          />
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleSettingsPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="settings-outline" size={22} color="#6366F1" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleHelpPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="help-circle-outline" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionText}>Help</Text>
            </TouchableOpacity>
          </View>
          
          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : null}
      
      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          visible={isEditModalVisible}
          profile={profile}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleSaveProfile}
          isLoading={updateProfile.isPending}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  bottomPadding: {
    height: 40,
  },
  
  // Skeleton styles
  skeletonContainer: {
    padding: 16,
  },
  skeletonHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonName: {
    width: 150,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  skeletonEmail: {
    width: 200,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonBadge: {
    width: 100,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  skeletonCard: {
    height: 140,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonStats: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
