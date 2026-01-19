// examples/CardEditScreen-PhotoIntegration.tsx
// Example showing how to integrate PhotoUploader into the card edit screen
// This is a partial example - integrate into your existing CardEditScreen

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { PhotoUploader, urlsToPhotos, photosToUrls } from '../src/components/photos';
import { Photo } from '../src/types/photo';
import { useAuthStore } from '../src/stores/authStore';

// Example card data type
interface CardFormData {
  title: string;
  surgeonName: string;
  procedureName: string;
  specialty: string;
  generalNotes: string;
  setupNotes: string;
  items: any[];
  setupPhotos: string[]; // URLs stored in database
}

interface CardEditScreenProps {
  cardId?: string; // undefined for new card
  initialData?: CardFormData;
}

/**
 * Example integration of PhotoUploader in card edit screen
 */
export function CardEditScreenWithPhotos({
  cardId,
  initialData,
}: CardEditScreenProps) {
  const user = useAuthStore((state) => state.user);
  
  // Form state
  const [formData, setFormData] = useState<CardFormData>({
    title: initialData?.title || '',
    surgeonName: initialData?.surgeonName || '',
    procedureName: initialData?.procedureName || '',
    specialty: initialData?.specialty || '',
    generalNotes: initialData?.generalNotes || '',
    setupNotes: initialData?.setupNotes || '',
    items: initialData?.items || [],
    setupPhotos: initialData?.setupPhotos || [],
  });
  
  // Photo state - convert URLs to Photo objects for the component
  const [photos, setPhotos] = useState<Photo[]>(() =>
    urlsToPhotos(initialData?.setupPhotos || [])
  );
  
  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Update photos when they change
  const handlePhotosChange = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    setHasChanges(true);
  };
  
  // Save handler
  const handleSave = async () => {
    try {
      // Check if any photos are still uploading
      const uploadingPhotos = photos.filter(
        p => p.uploadStatus === 'uploading' || p.uploadStatus === 'pending'
      );
      
      if (uploadingPhotos.length > 0) {
        Alert.alert(
          'Photos Uploading',
          'Please wait for all photos to finish uploading before saving.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Check for failed uploads
      const failedPhotos = photos.filter(p => p.uploadStatus === 'error');
      
      if (failedPhotos.length > 0) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Failed Uploads',
            `${failedPhotos.length} photo(s) failed to upload. Do you want to save without these photos?`,
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Save Anyway', onPress: () => resolve(true) },
            ]
          );
        });
        
        if (!proceed) return;
      }
      
      // Convert photos back to URLs for API
      const photoUrls = photosToUrls(photos);
      
      // Prepare card data for API
      const cardData = {
        ...formData,
        setupPhotos: photoUrls,
      };
      
      // Call your card API to save
      // await updateCard(cardId, cardData);
      // or
      // await createCard(cardData);
      
      console.log('Saving card with data:', cardData);
      
      setHasChanges(false);
      Alert.alert('Success', 'Card saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* ... Other form sections (title, surgeon, procedure, etc.) ... */}
      
      {/* Photos Section */}
      <View style={styles.section}>
        <PhotoUploader
          photos={photos}
          onPhotosChange={handlePhotosChange}
          cardId={cardId}
          userId={user?.id}
          maxPhotos={10}
          showHeader={true}
          headerTitle="Setup Photos"
        />
      </View>
      
      {/* ... Other form sections (items, notes, etc.) ... */}
      
      {/* Save button would go here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});

export default CardEditScreenWithPhotos;
