// src/hooks/useImagePicker.ts
// Hook for handling camera and gallery image selection

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';
import { PhotoPickerResult } from '../types/photo';
import { IMAGE_PICKER_CONFIG } from '../utils/constants';

interface UseImagePickerReturn {
  /** Pick an image from camera */
  pickFromCamera: () => Promise<PhotoPickerResult | null>;
  /** Pick image(s) from gallery */
  pickFromGallery: (allowMultiple?: boolean) => Promise<PhotoPickerResult[] | null>;
  /** Request camera and gallery permissions */
  requestPermissions: () => Promise<{ camera: boolean; gallery: boolean }>;
  /** Current camera permission status */
  cameraPermissionStatus: ImagePicker.PermissionStatus | null;
  /** Current gallery permission status */
  galleryPermissionStatus: ImagePicker.PermissionStatus | null;
  /** Whether permissions are being checked */
  isCheckingPermissions: boolean;
}

/**
 * Hook for image picker functionality with permission handling
 */
export function useImagePicker(): UseImagePickerReturn {
  const [cameraPermissionStatus, setCameraPermissionStatus] = 
    useState<ImagePicker.PermissionStatus | null>(null);
  const [galleryPermissionStatus, setGalleryPermissionStatus] = 
    useState<ImagePicker.PermissionStatus | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  /**
   * Request all permissions
   */
  const requestPermissions = useCallback(async () => {
    setIsCheckingPermissions(true);
    
    try {
      const [cameraResult, galleryResult] = await Promise.all([
        ImagePicker.requestCameraPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync(),
      ]);
      
      setCameraPermissionStatus(cameraResult.status);
      setGalleryPermissionStatus(galleryResult.status);
      
      return {
        camera: cameraResult.status === 'granted',
        gallery: galleryResult.status === 'granted',
      };
    } finally {
      setIsCheckingPermissions(false);
    }
  }, []);

  /**
   * Show settings alert when permission is denied
   */
  const showPermissionDeniedAlert = useCallback((type: 'camera' | 'gallery') => {
    const title = type === 'camera' ? 'Camera Access' : 'Photo Library Access';
    const message = type === 'camera'
      ? 'Please allow camera access in Settings to take photos.'
      : 'Please allow photo library access in Settings to select photos.';
    
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }, []);

  /**
   * Convert ImagePicker result to PhotoPickerResult
   */
  const convertResult = (
    asset: ImagePicker.ImagePickerAsset
  ): PhotoPickerResult => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: asset.type,
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize ?? undefined,
    base64: asset.base64 ?? undefined,
  });

  /**
   * Pick an image from camera
   */
  const pickFromCamera = useCallback(async (): Promise<PhotoPickerResult | null> => {
    // Check permission
    let { status } = await ImagePicker.getCameraPermissionsAsync();
    
    if (status !== 'granted') {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      status = permissionResult.status;
      setCameraPermissionStatus(status);
    }
    
    if (status !== 'granted') {
      showPermissionDeniedAlert('camera');
      return null;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_PICKER_CONFIG.mediaTypes,
        allowsEditing: IMAGE_PICKER_CONFIG.allowsEditing,
        aspect: IMAGE_PICKER_CONFIG.aspect,
        quality: IMAGE_PICKER_CONFIG.quality,
        exif: false,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      return convertResult(result.assets[0]);
    } catch (error) {
      console.error('Camera picker error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      return null;
    }
  }, [showPermissionDeniedAlert]);

  /**
   * Pick image(s) from gallery
   */
  const pickFromGallery = useCallback(async (
    allowMultiple: boolean = true
  ): Promise<PhotoPickerResult[] | null> => {
    // Check permission
    let { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = permissionResult.status;
      setGalleryPermissionStatus(status);
    }
    
    if (status !== 'granted') {
      showPermissionDeniedAlert('gallery');
      return null;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_PICKER_CONFIG.mediaTypes,
        allowsEditing: !allowMultiple && IMAGE_PICKER_CONFIG.allowsEditing,
        aspect: IMAGE_PICKER_CONFIG.aspect,
        quality: IMAGE_PICKER_CONFIG.quality,
        allowsMultipleSelection: allowMultiple,
        selectionLimit: allowMultiple ? IMAGE_PICKER_CONFIG.selectionLimit : 1,
        exif: false,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      return result.assets.map(convertResult);
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
      return null;
    }
  }, [showPermissionDeniedAlert]);

  return {
    pickFromCamera,
    pickFromGallery,
    requestPermissions,
    cameraPermissionStatus,
    galleryPermissionStatus,
    isCheckingPermissions,
  };
}

export default useImagePicker;
