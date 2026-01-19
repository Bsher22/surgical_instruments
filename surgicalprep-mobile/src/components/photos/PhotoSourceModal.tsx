// src/components/photos/PhotoSourceModal.tsx
// Bottom sheet modal for choosing camera or gallery

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoSourceModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Called when camera option is selected */
  onSelectCamera: () => void;
  /** Called when gallery option is selected */
  onSelectGallery: () => void;
  /** Title for the modal */
  title?: string;
}

/**
 * Bottom sheet modal for selecting photo source (camera or gallery)
 */
export function PhotoSourceModal({
  visible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title = 'Add Photo',
}: PhotoSourceModalProps) {
  const insets = useSafeAreaInsets();
  
  const handleCameraPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
    onClose();
    // Small delay to allow modal to close before opening camera
    setTimeout(onSelectCamera, 100);
  };
  
  const handleGalleryPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
    onClose();
    // Small delay to allow modal to close before opening gallery
    setTimeout(onSelectGallery, 100);
  };
  
  const handleCancel = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics not available
    }
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>
      
      {/* Bottom sheet */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Options */}
        <View style={styles.options}>
          {/* Camera option */}
          <TouchableOpacity
            style={styles.option}
            onPress={handleCameraPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.cameraIcon]}>
              <Ionicons name="camera" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
            <Text style={styles.optionSubtext}>Use camera</Text>
          </TouchableOpacity>
          
          {/* Gallery option */}
          <TouchableOpacity
            style={styles.option}
            onPress={handleGalleryPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.galleryIcon]}>
              <Ionicons name="images" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.optionText}>Choose Photo</Text>
            <Text style={styles.optionSubtext}>From library</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  option: {
    alignItems: 'center',
    width: 100,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraIcon: {
    backgroundColor: '#3B82F6',
  },
  galleryIcon: {
    backgroundColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default PhotoSourceModal;
