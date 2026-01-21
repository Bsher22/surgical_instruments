import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

interface ZoomableImageProps {
  uri: string | null;
  alt: string;
  fallbackIcon?: string;
}

// Web-compatible ZoomableImage that doesn't use gesture handler or reanimated
export function ZoomableImage({ uri, alt, fallbackIcon = 'medical-outline' }: ZoomableImageProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(1);

  const openModal = () => {
    setScale(1);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setScale(1);
  };

  const toggleZoom = () => {
    setScale(scale > 1 ? 1 : 2.5);
  };

  // Fallback placeholder when no image
  if (!uri || hasError) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name={fallbackIcon as any} size={80} color="#CBD5E1" />
        <Text style={styles.placeholderText}>No image available</Text>
      </View>
    );
  }

  return (
    <>
      {/* Thumbnail view */}
      <Pressable onPress={openModal} style={styles.thumbnailContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
        <Image
          source={{ uri }}
          style={styles.thumbnail}
          resizeMode="cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        <View style={styles.zoomHint}>
          <Ionicons name="expand-outline" size={18} color="#FFF" />
          <Text style={styles.zoomHintText}>Tap to zoom</Text>
        </View>
      </Pressable>

      {/* Full screen modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={28} color="#FFF" />
          </Pressable>

          <Pressable onPress={toggleZoom} style={styles.imageContainer}>
            <Image
              source={{ uri }}
              style={[
                styles.fullImage,
                { transform: [{ scale }] }
              ]}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.imageAlt}>{alt}</Text>
          <Text style={styles.gestureHint}>
            {Platform.OS === 'web' ? 'Click to toggle zoom' : 'Double tap to toggle zoom'}
          </Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbnailContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    zIndex: 1,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  zoomHintText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholder: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  imageAlt: {
    position: 'absolute',
    bottom: 80,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  gestureHint: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
