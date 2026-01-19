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
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

interface ZoomableImageProps {
  uri: string | null;
  alt: string;
  fallbackIcon?: string;
}

export function ZoomableImage({ uri, alt, fallbackIcon = 'medical-outline' }: ZoomableImageProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Zoom/pan values for modal
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const openModal = () => {
    resetZoom();
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetZoom();
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), 5);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
    });

  // Pan gesture for moving the zoomed image
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to zoom in/out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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
        statusBarTranslucent
      >
        <GestureHandlerRootView style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={28} color="#FFF" />
          </Pressable>

          <GestureDetector gesture={composedGesture}>
            <Animated.Image
              source={{ uri }}
              style={[styles.fullImage, animatedStyle]}
              resizeMode="contain"
            />
          </GestureDetector>

          <Text style={styles.imageAlt}>{alt}</Text>
          <Text style={styles.gestureHint}>Pinch to zoom • Double tap to toggle</Text>
        </GestureHandlerRootView>
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
