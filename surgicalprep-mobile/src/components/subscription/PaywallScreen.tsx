/**
 * Paywall Screen Component
 * Main screen for subscription purchase
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSubscription } from '../../hooks/useSubscription';
import { useAvailablePlans } from '../../api/subscriptions';
import PricingCard from './PricingCard';
import BenefitItem from './BenefitItem';
import { PREMIUM_BENEFITS, SUBSCRIPTION_URLS, PRICING } from '../../constants/subscription';
import { SubscriptionPlan } from '../../types/subscription';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const router = useRouter();
  const {
    selectedPlan,
    setSelectedPlan,
    startCheckout,
    restorePurchases,
    isCheckingOut,
    isRestoringPurchases,
    isPremium,
  } = useSubscription();
  
  const { data: plansData, isLoading: isLoadingPlans } = useAvailablePlans();
  
  // If already premium, show different content
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.premiumContainer}>
          <View style={styles.premiumBadge}>
            <Feather name="award" size={48} color="#10B981" />
          </View>
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumSubtitle}>
            Thank you for your support. You have unlimited access to all features.
          </Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.back()}
          >
            <Text style={styles.manageButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleSubscribe = useCallback(async () => {
    await startCheckout(selectedPlan);
  }, [startCheckout, selectedPlan]);
  
  const handleRestore = useCallback(async () => {
    await restorePurchases();
  }, [restorePurchases]);
  
  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <Feather name="zap" size={32} color="#6366F1" />
          </View>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock unlimited access to supercharge your surgical prep
          </Text>
        </View>
        
        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Premium Benefits</Text>
          {PREMIUM_BENEFITS.map((benefit) => (
            <BenefitItem
              key={benefit.id}
              icon={benefit.icon as any}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </View>
        
        {/* Plan Selection */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          <View style={styles.planToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'monthly' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'annual' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedPlan('annual')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === 'annual' && styles.toggleTextActive,
                ]}
              >
                Annual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 50%</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Selected Plan Card */}
          <PricingCard
            plan={selectedPlan}
            price={PRICING[selectedPlan].price}
            interval={PRICING[selectedPlan].interval}
            perMonthPrice={PRICING[selectedPlan].perMonthPrice}
            savingsPercent={selectedPlan === 'annual' ? PRICING.annual.savingsPercent : undefined}
            isSelected
          />
        </View>
        
        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isCheckingOut && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        
        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isRestoringPurchases}
        >
          {isRestoringPurchases ? (
            <ActivityIndicator color="#6366F1" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
        
        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity onPress={() => openLink(SUBSCRIPTION_URLS.termsOfService)}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>|</Text>
          <TouchableOpacity onPress={() => openLink(SUBSCRIPTION_URLS.privacyPolicy)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Payment will be charged to your payment method. Subscription automatically
          renews unless canceled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  
  // Benefits Section
  benefitsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  
  // Plans Section
  plansSection: {
    marginBottom: 24,
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#111827',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Subscribe Button
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Restore Button
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '500',
  },
  
  // Legal Section
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  legalLink: {
    fontSize: 13,
    color: '#6B7280',
  },
  legalDivider: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  
  // Disclaimer
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Premium State
  premiumContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  premiumBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  manageButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
