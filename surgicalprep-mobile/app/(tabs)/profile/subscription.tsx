/**
 * Subscription Screen
 * Profile tab subscription management page
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSubscription, useSubscriptionDeepLinks } from '../../../src/hooks/useSubscription';
import { useUsageStats } from '../../../src/hooks/usePremiumFeature';
import PaywallScreen from '../../../src/components/subscription/PaywallScreen';
import { TierBadge } from '../../../src/components/subscription/PremiumBadge';
import { PRICING } from '../../../src/constants/subscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    status,
    isLoadingStatus,
    isPremium,
    tier,
    openPortal,
    refreshSubscription,
    isOpeningPortal,
  } = useSubscription();
  
  const usageStats = useUsageStats();
  
  // Handle deep links for subscription callbacks
  useSubscriptionDeepLinks();
  
  // If not premium, show paywall
  if (!isPremium) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Upgrade',
            headerShown: true,
          }}
        />
        <PaywallScreen />
      </>
    );
  }
  
  // Premium user - show subscription management
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Subscription',
          headerShown: true,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingStatus}
            onRefresh={refreshSubscription}
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Feather name="award" size={28} color="#6366F1" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Premium Member</Text>
              <TierBadge tier="premium" />
            </View>
          </View>
          
          {status?.expires_at && (
            <View style={styles.expirationRow}>
              <Feather name="calendar" size={16} color="#6B7280" />
              <Text style={styles.expirationText}>
                {status.status === 'canceled'
                  ? `Access until ${formatDate(status.expires_at)}`
                  : `Renews on ${formatDate(status.expires_at)}`}
              </Text>
            </View>
          )}
          
          {status?.plan && (
            <View style={styles.planRow}>
              <Feather name="credit-card" size={16} color="#6B7280" />
              <Text style={styles.planText}>
                {status.plan === 'annual'
                  ? `Annual Plan - ${PRICING.annual.displayPrice}`
                  : `Monthly Plan - ${PRICING.monthly.displayPrice}`}
              </Text>
            </View>
          )}
        </View>
        
        {/* Usage Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Usage</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="layers"
              label="Preference Cards"
              value={usageStats.cards.displayText}
              color="#6366F1"
            />
            <StatCard
              icon="brain"
              label="Quizzes Today"
              value={usageStats.quizzes.displayText}
              color="#10B981"
            />
          </View>
        </View>
        
        {/* Subscription Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Subscription</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openPortal}
            disabled={isOpeningPortal}
          >
            <View style={styles.actionButtonContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="settings" size={18} color="#6366F1" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Billing & Payment</Text>
                <Text style={styles.actionSubtitle}>
                  Update payment method, view invoices
                </Text>
              </View>
            </View>
            {isOpeningPortal ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openPortal}
            disabled={isOpeningPortal}
          >
            <View style={styles.actionButtonContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="refresh-cw" size={18} color="#D97706" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Change Plan</Text>
                <Text style={styles.actionSubtitle}>
                  Switch between monthly and annual
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openPortal}
            disabled={isOpeningPortal}
          >
            <View style={styles.actionButtonContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="x-circle" size={18} color="#DC2626" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Cancel Subscription</Text>
                <Text style={styles.actionSubtitle}>
                  You'll keep access until {status?.expires_at ? formatDate(status.expires_at) : 'end of period'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {/* Premium Benefits Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
          <View style={styles.benefitsList}>
            <BenefitRow icon="check-circle" text="Unlimited preference cards" />
            <BenefitRow icon="check-circle" text="Unlimited daily quizzes" />
            <BenefitRow icon="check-circle" text="Full instrument details" />
            <BenefitRow icon="check-circle" text="Unlimited flashcard sessions" />
            <BenefitRow icon="check-circle" text="Ad-free experience" />
          </View>
        </View>
        
        {/* Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>
            Need help with your subscription?
          </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Feather name={icon as any} size={18} color="#10B981" />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusInfo: {
    flex: 1,
    gap: 6,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  expirationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planText: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  actionButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  // Benefits List
  benefitsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
  },
  
  // Support
  supportSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  supportLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});
