# Stage 12: Launch Preparation

Complete launch preparation package for SurgicalPrep app store submission.

## 📦 Package Contents

```
stage-12-launch-prep/
├── STAGE_12_OUTLINE.md          # Detailed implementation guide
├── README.md                     # This file
│
├── config/                       # Build & deployment configuration
│   ├── eas.json                 # EAS Build configuration
│   ├── app.config.ts            # Dynamic Expo config
│   └── app.json.example         # Example app.json
│
├── legal/                        # Legal documents (host these publicly)
│   ├── privacy-policy.html      # Privacy Policy page
│   ├── terms-of-service.html    # Terms of Service page
│   ├── medical-disclaimer.html  # Medical Disclaimer page
│   └── README.md                # Hosting instructions
│
├── store-assets/                 # App store listing materials
│   ├── metadata/
│   │   ├── ios-metadata.json    # iOS App Store metadata
│   │   └── android-metadata.json # Google Play metadata
│   ├── screenshots/
│   │   └── README.md            # Screenshot requirements
│   └── icon/
│       └── README.md            # Icon requirements
│
├── monitoring/                   # Analytics & error tracking
│   ├── analytics.ts             # Firebase Analytics setup
│   ├── analyticsEvents.ts       # Event constants & types
│   ├── sentry.ts                # Sentry error monitoring
│   ├── index.ts                 # Barrel exports
│   └── hooks/
│       └── useAnalytics.ts      # React hooks for analytics
│
├── scripts/                      # Build & submission scripts
│   ├── build-production.sh      # Production build script
│   ├── submit-stores.sh         # Store submission script
│   ├── pre-submission-checklist.md  # Complete checklist
│   └── launch-day-runbook.md    # Launch day operations guide
│
├── components/                   # UI components
│   └── MedicalDisclaimer.tsx    # In-app disclaimer modal
│
└── examples/                     # Integration examples
    └── app-layout-example.tsx   # Root layout with monitoring
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# In your mobile project
npm install @sentry/react-native expo-firebase-analytics
# or
yarn add @sentry/react-native expo-firebase-analytics
```

### 2. Set Up Monitoring

Copy monitoring files to your project:
```bash
cp -r monitoring/* your-project/src/services/
cp monitoring/hooks/* your-project/src/hooks/
```

### 3. Configure Environment

Add to your `.env` or EAS secrets:
```
EXPO_PUBLIC_API_URL=https://api.surgicalprep.app
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

### 4. Host Legal Documents

Upload the legal HTML files to:
- GitHub Pages: `https://yourusername.github.io/surgicalprep-legal/`
- Or your custom domain: `https://surgicalprep.app/`

### 5. Create Store Assets

Follow the guides in `store-assets/` to create:
- App icon (1024x1024)
- Screenshots (5-8 per device size)
- Feature graphic (Android, 1024x500)

### 6. Build & Submit

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Build production app
./scripts/build-production.sh all

# Submit to stores
./scripts/submit-stores.sh
```

## 📋 Implementation Order

1. **Legal Documents** (2-3 hours)
   - Customize and host privacy policy, terms, disclaimer
   - Update URLs in app and store listings

2. **Monitoring Setup** (3-4 hours)
   - Set up Firebase project
   - Configure Sentry
   - Integrate analytics hooks

3. **Store Assets** (4-6 hours)
   - Create app icon
   - Take screenshots
   - Write descriptions

4. **Build Configuration** (1-2 hours)
   - Configure eas.json
   - Set up app.config.ts
   - Add environment variables

5. **Submission** (2-3 hours)
   - Build production binaries
   - Submit to App Store
   - Submit to Google Play

## ⚙️ Configuration

### EAS Build Profiles

| Profile | Use Case |
|---------|----------|
| `development` | Local development with dev client |
| `preview` | Internal testing builds |
| `production` | App store submission |

### Required Secrets

Set these in EAS or your CI:
```bash
eas secret:create --name SENTRY_DSN --value "xxx"
eas secret:create --name FIREBASE_API_KEY --value "xxx"
eas secret:create --name STRIPE_PUBLISHABLE_KEY --value "xxx"
```

## 📊 Analytics Events

Key events tracked:

| Category | Events |
|----------|--------|
| Auth | sign_up, login, logout |
| Instruments | view, search, filter, bookmark |
| Cards | create, edit, delete, duplicate |
| Quiz | start, complete, answer_correct/incorrect |
| Subscription | view_paywall, complete, cancel |

## 🔒 Legal Checklist

- [ ] Privacy Policy hosted and accessible
- [ ] Terms of Service hosted and accessible
- [ ] Medical Disclaimer hosted and in-app
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)
- [ ] App Store privacy declarations complete
- [ ] Play Store data safety form complete

## 📱 Store Submission Checklist

### iOS App Store
- [ ] App Store Connect account ($99/year)
- [ ] App created and configured
- [ ] Screenshots (all required sizes)
- [ ] App description and keywords
- [ ] Demo account for reviewers
- [ ] Privacy declarations
- [ ] In-app purchases configured

### Google Play Store
- [ ] Play Console account ($25 one-time)
- [ ] App created and configured
- [ ] Screenshots and feature graphic
- [ ] Store listing complete
- [ ] Content rating questionnaire
- [ ] Data safety form
- [ ] Service account for API

## ⏱️ Timeline

| Task | Estimated Time |
|------|---------------|
| Legal documents | 2-3 hours |
| Analytics setup | 2-3 hours |
| Error monitoring | 1-2 hours |
| Store assets | 4-6 hours |
| Build config | 1-2 hours |
| Submission | 2-3 hours |
| **Total** | **12-19 hours** |

App review times:
- iOS: 1-3 days (up to 7)
- Android: 1-7 days

## 🆘 Troubleshooting

### Build fails
- Check eas.json configuration
- Verify all secrets are set
- Check Expo SDK version compatibility

### Submission rejected (iOS)
- Common: Missing demo account
- Common: Broken privacy policy URL
- Common: Missing permission descriptions

### Submission rejected (Android)
- Common: Data safety form incomplete
- Common: Content rating missing
- Common: Target API level too low

## 📚 Resources

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/console/about/guides/releasewithconfidence/)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)

## ✅ Ready to Launch?

1. Complete the [pre-submission checklist](scripts/pre-submission-checklist.md)
2. Review the [launch day runbook](scripts/launch-day-runbook.md)
3. Build and submit!

Good luck with your launch! 🎉
