# Stage 12 Dependencies

These are the dependencies required for Stage 12 features.

## NPM Install Commands

```bash
# Analytics & Monitoring
npx expo install expo-firebase-analytics
npm install @sentry/react-native

# For Sentry with Expo
npx expo install @sentry/react-native

# Async Storage (for disclaimer acceptance)
npx expo install @react-native-async-storage/async-storage
```

## Package.json Additions

Add these to your existing package.json:

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.21.0",
    "@sentry/react-native": "^5.19.0",
    "expo-firebase-analytics": "~12.0.0"
  }
}
```

Note: Version numbers should match your Expo SDK version. Run `npx expo install` to get compatible versions.

## EAS Configuration

### Required Secrets

Set these using EAS CLI:

```bash
# Sentry DSN
eas secret:create --scope project --name SENTRY_DSN --value "https://xxx@sentry.io/xxx"

# Firebase (if not using google-services.json)
eas secret:create --scope project --name FIREBASE_API_KEY --value "xxx"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "surgicalprep"

# Stripe (for subscriptions)
eas secret:create --scope project --name STRIPE_PUBLISHABLE_KEY --value "pk_live_xxx"

# Apple submission (recommended)
eas secret:create --scope project --name APPLE_ID --value "your@email.com"
eas secret:create --scope project --name ASC_API_KEY_ID --value "xxx"
eas secret:create --scope project --name ASC_ISSUER_ID --value "xxx"
```

### Google Play Service Account

1. Go to Google Play Console → Setup → API access
2. Create a service account
3. Download the JSON key
4. Save as `google-service-account.json` in project root
5. Add to `.gitignore` (never commit this file!)

## Firebase Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project "SurgicalPrep"
3. Add iOS app with bundle ID
4. Add Android app with package name
5. Download config files

### 2. Add Config Files

**iOS:** Download `GoogleService-Info.plist` and add to your Expo project.

**Android:** Download `google-services.json` and add to your Expo project.

In `app.json`:
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 3. Enable Analytics

In Firebase Console:
1. Go to Analytics → Dashboard
2. Analytics should be enabled by default
3. Create custom events if needed

## Sentry Setup

### 1. Create Sentry Project

1. Go to https://sentry.io
2. Create new project → React Native
3. Copy the DSN

### 2. Configure in app.config.ts

```typescript
plugins: [
  [
    '@sentry/react-native/expo',
    {
      organization: 'your-org',
      project: 'surgicalprep-mobile',
    },
  ],
],
```

### 3. Upload Source Maps

Source maps are automatically uploaded during EAS builds if you've configured the Sentry plugin.

For manual uploads:
```bash
npx sentry-expo-upload-sourcemaps dist
```

## Expo Plugins

Add to `app.json` plugins array:

```json
{
  "plugins": [
    "expo-router",
    "expo-secure-store",
    "@sentry/react-native/expo"
  ]
}
```

## Development vs Production

The monitoring services are configured to:
- Disable in `__DEV__` mode
- Only initialize when proper credentials exist
- Log to console in development for debugging

This prevents development noise from polluting production analytics.
