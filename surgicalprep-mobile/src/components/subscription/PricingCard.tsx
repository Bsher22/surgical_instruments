/**
 * Pricing Card Component
 * Displays a subscription plan with pricing details
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SubscriptionPlan, BillingInterval } from '../../types/subscription';

interface PricingCardProps {
  plan: SubscriptionPlan;
  price: number;
  interval: BillingInterval;
  perMonthPrice: number;
  savingsPercent?: number;
  isSelected?: boolean;
}

export default function PricingCard({
  plan,
  price,
  interval,
  perMonthPrice,
  savingsPercent,
  isSelected = false,
}: PricingCardProps) {
  const isAnnual = plan === 'annual';
  
  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      {/* Best Value Badge */}
      {isAnnual && savingsPercent && (
        <View style={styles.bestValueBadge}>
          <Feather name="star" size={12} color="#FFFFFF" />
          <Text style={styles.bestValueText}>Best Value</Text>
        </View>
      )}
      
      <View style={styles.content}>
        {/* Plan Name */}
        <Text style={styles.planName}>
          {isAnnual ? 'Annual' : 'Monthly'} Premium
        </Text>
        
        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.priceAmount}>{price.toFixed(2)}</Text>
          <Text style={styles.priceInterval}>
            /{interval === 'year' ? 'year' : 'month'}
          </Text>
        </View>
        
        {/* Per Month Breakdown (for annual) */}
        {isAnnual && (
          <Text style={styles.perMonth}>
            Just ${perMonthPrice.toFixed(2)}/month billed annually
          </Text>
        )}
        
        {/* Savings Badge */}
        {savingsPercent && (
          <View style={styles.savingsContainer}>
            <Feather name="check-circle" size={14} color="#10B981" />
            <Text style={styles.savingsText}>
              Save {savingsPercent}% compared to monthly
            </Text>
          </View>
        )}
        
        {/* Features Preview */}
        <View style={styles.featuresPreview}>
          <FeatureItem text="Unlimited preference cards" />
          <FeatureItem text="Unlimited daily quizzes" />
          <FeatureItem text="Full instrument details" />
          <FeatureItem text="Ad-free experience" />
        </View>
      </View>
    </View>
  );
}

// Feature Item Sub-component
function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Feather name="check" size={14} color="#10B981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  containerSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  
  bestValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 6,
    gap: 4,
  },
  bestValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  content: {
    padding: 20,
  },
  
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currency: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
  },
  priceInterval: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  
  perMonth: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#065F46',
  },
  
  featuresPreview: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
});
