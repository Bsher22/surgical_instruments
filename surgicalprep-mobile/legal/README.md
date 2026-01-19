# Legal Documents - Hosting Guide

This folder contains the legal documents required for app store submission:

- `privacy-policy.html` - Privacy Policy
- `terms-of-service.html` - Terms of Service  
- `medical-disclaimer.html` - Medical Disclaimer

## Hosting Options

### Option 1: GitHub Pages (Free, Recommended)

1. Create a new repository: `surgicalprep-legal`
2. Upload these HTML files
3. Go to Settings → Pages
4. Select "Deploy from a branch" → main → / (root)
5. Your URLs will be:
   - `https://yourusername.github.io/surgicalprep-legal/privacy-policy.html`
   - `https://yourusername.github.io/surgicalprep-legal/terms-of-service.html`
   - `https://yourusername.github.io/surgicalprep-legal/medical-disclaimer.html`

### Option 2: Vercel (Free)

1. Create a new Vercel project
2. Upload these files
3. Deploy
4. Set up a custom domain or use the provided `.vercel.app` URL

### Option 3: Custom Domain

1. Upload files to your web server
2. Set up at your domain:
   - `https://surgicalprep.app/privacy`
   - `https://surgicalprep.app/terms`
   - `https://surgicalprep.app/disclaimer`

## Required Updates

Before deploying, update the following in each file:

### privacy-policy.html
- [ ] Replace `[Your Company Name]` with your legal entity name
- [ ] Update contact email addresses
- [ ] Review data collection statements for accuracy
- [ ] Add your actual address if required

### terms-of-service.html
- [ ] Replace `[Your State]` with your jurisdiction
- [ ] Update contact email addresses
- [ ] Review subscription terms match your actual pricing
- [ ] Consider having a lawyer review

### medical-disclaimer.html
- [ ] Review language with a healthcare legal professional (recommended)
- [ ] Update contact email addresses

## App Store Requirements

### iOS App Store
- Privacy Policy URL is **required** for all apps
- Must be publicly accessible (no login required)
- Must be in the user's language or English

### Google Play Store
- Privacy Policy URL is **required** for apps that:
  - Request access to sensitive permissions
  - Handle user data
  - Have user accounts
- Must link from within the app AND the store listing

## In-App Links

Add links to these pages in your app:
- Settings/About screen
- Registration/Sign-up flow
- First-time user onboarding

Example implementation:
```typescript
import { Linking } from 'react-native';

const LEGAL_URLS = {
  privacy: 'https://yourdomain.com/privacy-policy.html',
  terms: 'https://yourdomain.com/terms-of-service.html',
  disclaimer: 'https://yourdomain.com/medical-disclaimer.html',
};

const openPrivacyPolicy = () => {
  Linking.openURL(LEGAL_URLS.privacy);
};
```

## Legal Review Recommendation

While these documents provide a good starting point, we **strongly recommend** having them reviewed by a qualified attorney, especially:

1. **Terms of Service** - Ensure enforceability in your jurisdiction
2. **Privacy Policy** - Ensure compliance with GDPR, CCPA, and other regulations
3. **Medical Disclaimer** - Given the healthcare context, professional review is important

## Checklist Before Submission

- [ ] All documents hosted and accessible via public URLs
- [ ] URLs tested and working
- [ ] Contact email addresses are valid and monitored
- [ ] Links added to app store listings
- [ ] Links added within the app (Settings/About screen)
- [ ] Medical disclaimer shown during onboarding (recommended)
- [ ] Legal review completed (recommended)
