// app/(tabs)/cards/edit/[id].tsx
// Screen for editing an existing preference card

import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { CardForm, CardFormHeader } from '../../../../src/components/cards';
import { useCardForm } from '../../../../src/hooks/useCardForm';
import { getCard } from '../../../../src/api/cards';
import { CardFormData } from '../../../../src/types/cardForm';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch existing card data
  const {
    data: card,
    isLoading: isLoadingCard,
    error: cardError,
    refetch,
  } = useQuery({
    queryKey: ['card', id],
    queryFn: () => getCard(id!),
    enabled: !!id,
  });

  // Convert API response to form data
  const initialData: Partial<CardFormData> | undefined = card
    ? {
        title: card.title,
        surgeonName: card.surgeon_name ?? '',
        procedureName: card.procedure_name ?? '',
        specialty: card.specialty ?? '',
        generalNotes: card.general_notes ?? '',
        setupNotes: card.setup_notes ?? '',
      }
    : undefined;

  const {
    data,
    errors,
    isDirty,
    isSubmitting,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    handleCancel,
  } = useCardForm({
    mode: 'edit',
    cardId: id,
    initialData,
  });

  // Handle hardware back button on Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isDirty) {
          Alert.alert(
            'Discard Changes?',
            'You have unsaved changes. Are you sure you want to discard them?',
            [
              { text: 'Keep Editing', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: handleCancel,
              },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [isDirty, handleCancel])
  );

  // Title validation check for enabling save button
  const canSave = data.title.trim().length >= 3;

  // Loading state
  if (isLoadingCard) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading card...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (cardError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load card</Text>
          <Text style={styles.errorMessage}>
            {cardError instanceof Error
              ? cardError.message
              : 'An error occurred while loading the card.'}
          </Text>
          <View style={styles.errorActions}>
            <Text style={styles.retryButton} onPress={() => refetch()}>
              Try Again
            </Text>
            <Text style={styles.backButton} onPress={handleCancel}>
              Go Back
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />

      {/* Custom Header */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Form Header with Save/Cancel */}
      <CardFormHeader
        title="Edit Card"
        onCancel={handleCancel}
        onSave={handleSubmit}
        isSaving={isSubmitting}
        isDirty={isDirty}
        canSave={canSave}
      />

      {/* Card Form */}
      <View style={styles.formContainer}>
        <CardForm
          data={data}
          errors={errors}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
          isSubmitting={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24,
  },
  retryButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
