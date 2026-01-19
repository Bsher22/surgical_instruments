/**
 * Jest Setup File
 * 
 * Configures the testing environment with necessary mocks and global setup.
 */
import '@testing-library/jest-native/extend-expect';

// =============================================================================
// React Native Mocks
// =============================================================================

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
    GestureHandlerRootView: View,
  };
});

// =============================================================================
// Expo Module Mocks
// =============================================================================

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://test-image.jpg' }],
  }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://test-image.jpg' }],
  }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: {
    All: 'All',
    Images: 'Images',
    Videos: 'Videos',
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    setParams: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  useSegments: jest.fn().mockReturnValue([]),
  usePathname: jest.fn().mockReturnValue('/'),
  Link: ({ children, ...props }: any) => children,
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
  Redirect: () => null,
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'SurgicalPrep',
      slug: 'surgicalprep',
      version: '1.0.0',
      extra: {
        apiUrl: 'http://localhost:8000',
      },
    },
    manifest: null,
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `surgicalprep://${path}`),
  parse: jest.fn(),
  openURL: jest.fn(),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: View,
    MaterialIcons: View,
    FontAwesome: View,
    Feather: View,
  };
});

// =============================================================================
// React Query Mock
// =============================================================================

// Mock QueryClient for testing
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query');
  return {
    ...originalModule,
    useQuery: jest.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }),
    useMutation: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
    }),
    useQueryClient: jest.fn().mockReturnValue({
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    }),
  };
});

// =============================================================================
// AsyncStorage Mock
// =============================================================================

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// =============================================================================
// Platform Mock
// =============================================================================

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((config) => config.ios ?? config.default),
  Version: 14,
}));

// =============================================================================
// Animated Mock
// =============================================================================

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.UIManager = {
    RCTView: () => ({}),
  };
  RN.NativeModules.StatusBarManager = {
    getHeight: jest.fn(),
  };
  return RN;
});

// =============================================================================
// Alert Mock
// =============================================================================

jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});

// =============================================================================
// Console Warnings Suppression
// =============================================================================

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes?.('Animated: `useNativeDriver`') ||
    args[0]?.includes?.('componentWillReceiveProps') ||
    args[0]?.includes?.('componentWillMount')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// =============================================================================
// Global Test Utilities
// =============================================================================

// Helper to wait for async operations
global.waitFor = async (callback: () => boolean, timeout = 5000) => {
  const startTime = Date.now();
  while (!callback()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

// Helper to flush promises
global.flushPromises = () => new Promise((resolve) => setImmediate(resolve));

// =============================================================================
// MSW Setup (if using Mock Service Worker)
// =============================================================================

// Uncomment if using MSW for API mocking
// import { server } from './__tests__/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// =============================================================================
// Type Declarations
// =============================================================================

declare global {
  function waitFor(callback: () => boolean, timeout?: number): Promise<void>;
  function flushPromises(): Promise<void>;
}

export {};
