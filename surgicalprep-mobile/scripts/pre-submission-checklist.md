# Pre-Submission Checklist

Use this checklist before submitting to the app stores. Complete all items to ensure a smooth review process.

---

## 🔧 Technical Preparation

### Build Configuration
- [ ] `app.json` / `app.config.ts` has correct bundle identifier
- [ ] Version number updated (1.0.0 for initial release)
- [ ] Build number incremented
- [ ] All environment variables set for production
- [ ] API URL points to production server
- [ ] Debug/development code removed
- [ ] Console.log statements removed or disabled in production

### Testing
- [ ] App tested on physical iOS device
- [ ] App tested on physical Android device
- [ ] All core features working:
  - [ ] Login/Signup
  - [ ] Instrument browsing
  - [ ] Instrument search and filter
  - [ ] Preference card creation
  - [ ] Preference card editing
  - [ ] Photo upload
  - [ ] Flashcard study
  - [ ] Multiple choice quiz
  - [ ] Progress tracking
  - [ ] Profile/settings
- [ ] Premium features gated correctly
- [ ] Free tier limits enforced
- [ ] No crashes or ANRs
- [ ] Network error handling works
- [ ] Offline behavior acceptable

### Backend
- [ ] Production backend deployed and stable
- [ ] Database migrated and seeded
- [ ] API endpoints tested with production URL
- [ ] SSL/HTTPS configured correctly
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Backup system in place

---

## 🍎 iOS App Store

### App Store Connect Setup
- [ ] Apple Developer account active ($99/year)
- [ ] App created in App Store Connect
- [ ] Bundle ID registered
- [ ] App Store Connect API key created (recommended)

### App Information
- [ ] App name: "SurgicalPrep - Instrument Study"
- [ ] Subtitle: "Flashcards & Preference Cards"
- [ ] Primary category: Medical
- [ ] Secondary category: Education
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Marketing URL (optional)

### Version Information
- [ ] Version string: 1.0.0
- [ ] Copyright: © 2026 SurgicalPrep
- [ ] What's New text written

### Pricing & Availability
- [ ] Price tier: Free
- [ ] In-App Purchases configured (if using)
- [ ] Availability set to all countries (or select countries)

### Screenshots
- [ ] 6.7" iPhone screenshots (1290 x 2796) - minimum 3
- [ ] 6.5" iPhone screenshots (1284 x 2778) - minimum 3
- [ ] 5.5" iPhone screenshots (1242 x 2208) - minimum 3
- [ ] iPad 12.9" screenshots (2048 x 2732) - if supporting iPad
- [ ] Screenshots show actual app content
- [ ] No placeholder text visible

### App Review Information
- [ ] Demo account credentials provided
  - Email: demo@surgicalprep.app
  - Password: [secure password]
- [ ] Contact information filled in
- [ ] Notes to reviewer written (explain app purpose, any special instructions)

### App Privacy
- [ ] Privacy policy URL accessible
- [ ] Data collection declarations completed
- [ ] No IDFA usage declared (if not using)
- [ ] App privacy details filled in

### In-App Purchases (if applicable)
- [ ] Subscription products created
- [ ] Pricing set for all territories
- [ ] Product descriptions written
- [ ] Review screenshots provided
- [ ] Subscription group configured

### Export Compliance
- [ ] ITSAppUsesNonExemptEncryption set to NO (if using standard HTTPS only)
- [ ] Export compliance documentation (if using custom encryption)

---

## 🤖 Google Play Store

### Play Console Setup
- [ ] Google Play Developer account active ($25 one-time)
- [ ] App created in Play Console
- [ ] Package name registered
- [ ] App signing by Google Play configured
- [ ] Service account for API access created

### Store Listing
- [ ] App name: "SurgicalPrep - Instrument Study"
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App category: Medical
- [ ] Contact email
- [ ] Privacy policy URL

### Graphics
- [ ] Hi-res icon (512 x 512)
- [ ] Feature graphic (1024 x 500)
- [ ] Phone screenshots (minimum 2, recommended 5+)
- [ ] Tablet screenshots (optional but recommended)

### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Rating certificate generated (should be "Everyone" or "Everyone 10+")

### Data Safety
- [ ] Data collection declarations completed:
  - [ ] Personal info (name, email)
  - [ ] Photos (user-uploaded)
  - [ ] App activity (usage data)
  - [ ] App info and performance (crash logs)
- [ ] Security practices declared
- [ ] Data deletion mechanism explained

### App Access
- [ ] Demo account credentials provided (if app requires login)

### Release Management
- [ ] Internal testing track tested
- [ ] Closed testing (beta) completed
- [ ] Production release created
- [ ] Release notes written
- [ ] Countries/regions selected

### Policies
- [ ] App content policy compliant
- [ ] Monetization policy compliant (for subscriptions)
- [ ] User data policy compliant
- [ ] Families policy (N/A - not targeting children)

---

## 📊 Monitoring & Analytics

### Analytics
- [ ] Firebase Analytics configured
- [ ] Key events being tracked
- [ ] User properties set up
- [ ] Dashboard access confirmed

### Error Monitoring
- [ ] Sentry configured with production DSN
- [ ] Source maps uploaded
- [ ] Test error captured successfully
- [ ] Alert notifications set up

### Uptime Monitoring
- [ ] UptimeRobot (or similar) configured
- [ ] API health endpoint monitored
- [ ] Alert email configured
- [ ] Status page URL (optional)

---

## 📋 Legal Documents

### Privacy Policy
- [ ] Hosted at accessible URL
- [ ] URL added to app stores
- [ ] URL added in-app (Settings/About)
- [ ] Content accurate and complete

### Terms of Service
- [ ] Hosted at accessible URL
- [ ] URL added to app stores
- [ ] URL added in-app (Settings/About)
- [ ] Content accurate and complete

### Medical Disclaimer
- [ ] Hosted at accessible URL
- [ ] Shown in-app during onboarding
- [ ] Accessible from Settings/About
- [ ] Content reviewed (preferably by legal professional)

---

## 🚀 Final Steps

### Before Submitting
- [ ] Double-check all URLs work (privacy, terms, support)
- [ ] Test demo account one more time
- [ ] Verify production build installs and runs
- [ ] Review all text for typos
- [ ] Confirm pricing is correct

### Submit
- [ ] Build production binary: `./scripts/build-production.sh`
- [ ] Wait for builds to complete
- [ ] Submit to iOS: `eas submit --platform ios`
- [ ] Submit to Android: `eas submit --platform android`

### After Submission
- [ ] Monitor for review status updates
- [ ] Check email for any reviewer questions
- [ ] Prepare marketing materials for launch
- [ ] Set up social media announcements
- [ ] Prepare support responses for common questions

---

## 📝 Notes

**Common iOS Rejection Reasons:**
- Login required without demo account
- Broken links (privacy policy, support)
- Missing permission usage descriptions
- Incomplete metadata
- Guideline 4.2: Minimum functionality

**Common Android Rejection Reasons:**
- Data safety form incomplete
- Content rating missing
- Policy violations
- Target API level too low
- Deceptive behavior

**Estimated Review Times:**
- iOS: 1-3 days (can be up to 7)
- Android: 1-7 days (internal testing is immediate)

---

## ✅ Sign-Off

| Item | Completed | Date | Notes |
|------|-----------|------|-------|
| Technical Testing | ☐ | | |
| iOS Assets | ☐ | | |
| Android Assets | ☐ | | |
| Legal Documents | ☐ | | |
| Monitoring Setup | ☐ | | |
| iOS Submission | ☐ | | |
| Android Submission | ☐ | | |
| Approved - iOS | ☐ | | |
| Approved - Android | ☐ | | |
| Live in Stores | ☐ | | |
