import { ConfigContext, ExpoConfig } from 'expo/config';

// Determine app variant from environment
const IS_DEV = process.env.EXPO_PUBLIC_APP_VARIANT === 'development';
const IS_PREVIEW = process.env.EXPO_PUBLIC_APP_VARIANT === 'preview';
const IS_PRODUCTION = process.env.EXPO_PUBLIC_APP_VARIANT === 'production';

// Bundle identifier suffixes for different environments
const getBundleIdentifier = () => {
  if (IS_DEV) return 'com.yourname.surgicalprep.dev';
  if (IS_PREVIEW) return 'com.yourname.surgicalprep.preview';
  return 'com.yourname.surgicalprep';
};

// App name variants
const getAppName = () => {
  if (IS_DEV) return 'SurgicalPrep (Dev)';
  if (IS_PREVIEW) return 'SurgicalPrep (Preview)';
  return 'SurgicalPrep';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'surgicalprep',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'surgicalprep',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A5C6B',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getBundleIdentifier(),
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'SurgicalPrep needs camera access to take photos for your preference cards.',
      NSPhotoLibraryUsageDescription:
        'SurgicalPrep needs photo library access to add setup photos to your preference cards.',
      NSPhotoLibraryAddUsageDescription:
        'SurgicalPrep needs permission to save photos to your library.',
      ITSAppUsesNonExemptEncryption: false,
    },
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: IS_PRODUCTION
      ? ['applinks:surgicalprep.app', 'webcredentials:surgicalprep.app']
      : [],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A5C6B',
    },
    package: getBundleIdentifier(),
    versionCode: 1,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
    intentFilters: IS_PRODUCTION
      ? [
          {
            action: 'VIEW',
            autoVerify: true,
            data: [
              {
                scheme: 'https',
                host: 'surgicalprep.app',
                pathPrefix: '/',
              },
            ],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ]
      : [],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission:
          'SurgicalPrep needs access to your photos to add setup images to preference cards.',
        cameraPermission:
          'SurgicalPrep needs camera access to capture setup photos for your preference cards.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'SurgicalPrep needs camera access to capture setup photos.',
      },
    ],
    // Sentry plugin for production builds
    ...(IS_PRODUCTION && process.env.EXPO_PUBLIC_SENTRY_DSN
      ? [
          [
            '@sentry/react-native/expo',
            {
              organization: 'your-org',
              project: 'surgicalprep-mobile',
            },
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
    // Environment-specific config
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  owner: 'your-expo-username',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID',
  },
});
