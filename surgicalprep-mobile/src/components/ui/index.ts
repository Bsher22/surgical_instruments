// src/components/ui/index.ts
// Barrel exports for UI components

// Loading states
export { LoadingSpinner, FullScreenLoader, ButtonSpinner } from './LoadingSpinner';
export {
  Skeleton,
  SkeletonText,
  SkeletonInstrumentCard,
  SkeletonPreferenceCard,
  SkeletonList,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonQuizCard,
} from './SkeletonLoader';

// Images
export {
  OptimizedImage,
  InstrumentImage,
  ImagePresets,
} from './OptimizedImage';
export type { OptimizedImageProps } from './OptimizedImage';

// Lists
export { OptimizedFlatList } from './OptimizedFlatList';
export type { OptimizedFlatListProps } from './OptimizedFlatList';

// Toast notifications
export { Toast } from './Toast';
export { ToastContainer } from './ToastContainer';

// Layout containers
export {
  SafeContainer,
  ScreenContainer,
  TabScreenContainer,
  ModalContainer,
  TabBarSpacer,
  EdgeToEdgeContainer,
  useSafeArea,
} from './SafeContainer';

// Keyboard handling
export {
  KeyboardAvoidingWrapper,
  KeyboardDismissView,
  useKeyboardVisible,
} from './KeyboardAvoidingWrapper';

// Scroll views
export { RefreshableScrollView } from './RefreshableScrollView';

// Buttons
export { Button, IconButton } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';
