// app/(tabs)/cards/new.tsx
// Screen for creating a new preference card

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CardForm, CardFormHeader } from '../../../src/components/cards';
import { useCardForm } from '../../../src/hooks/useCardForm';

export default function NewCardScreen() {
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
    mode: 'create',
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
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
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
        title="New Card"
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
});
