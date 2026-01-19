# Launch Day Runbook

A step-by-step guide for launch day operations.

---

## Pre-Launch (T-24 hours)

### Final Checks
- [ ] Verify production backend is running and healthy
- [ ] Confirm all environment variables are set correctly
- [ ] Test demo account credentials work
- [ ] Verify analytics events are being received
- [ ] Check error monitoring is capturing test errors
- [ ] Confirm uptime monitoring is active

### Prepare Marketing
- [ ] Draft social media posts (ready to publish)
- [ ] Prepare email to beta testers
- [ ] Have app store links ready (will activate once approved)
- [ ] Prepare press kit / screenshots for sharing

### Team Readiness
- [ ] Confirm who is on-call for launch
- [ ] Share emergency contact info
- [ ] Review escalation procedures
- [ ] Clear calendars for launch window

---

## Launch Morning (T-0)

### Monitor App Store Status

**iOS App Store Connect:**
```
https://appstoreconnect.apple.com
```
- Check app status (Waiting for Review → In Review → Ready for Sale)
- Typical review time: 1-3 days

**Google Play Console:**
```
https://play.google.com/console
```
- Check release status (In Review → Available on Google Play)
- Typical review time: 1-7 days

### When Approved

1. **Verify the app is live:**
   - Search for "SurgicalPrep" in App Store
   - Search for "SurgicalPrep" in Google Play
   - Try downloading on a fresh device

2. **Test critical flows on production:**
   - Sign up with new account
   - Log in
   - Browse instruments
   - Create a preference card
   - Start a quiz
   - View profile

3. **Announce the launch:**
   - Post on Twitter/X
   - Post on LinkedIn
   - Post in r/scrubtech subreddit
   - Post in surgical tech Facebook groups
   - Send email to beta testers
   - Update website

---

## Monitoring Dashboard

Keep these open on launch day:

### Analytics
- **Firebase Console:** https://console.firebase.google.com
  - Real-time users
  - Events by hour
  - New users

### Error Monitoring
- **Sentry:** https://sentry.io
  - Open issues
  - Error rate
  - Crash-free sessions

### Infrastructure
- **Railway Dashboard:** https://railway.app (or your host)
  - CPU/Memory usage
  - Request count
  - Error rate

- **Supabase Dashboard:** https://app.supabase.com
  - Database connections
  - API requests
  - Storage usage

### Uptime
- **UptimeRobot:** https://uptimerobot.com
  - API status
  - Response time

---

## Incident Response

### If Backend Goes Down

1. Check Railway/Render logs for errors
2. Check Supabase status: https://status.supabase.com
3. If deployment issue, rollback:
   ```bash
   # Railway - click "Rollback" in dashboard
   # Render - click "Manual Deploy" with previous commit
   ```
4. If database issue, check Supabase dashboard
5. Post status update to users if extended outage

### If App Crashes

1. Check Sentry for crash reports
2. Identify affected version and user segment
3. If critical:
   - Prepare hotfix
   - Build and submit expedited review (iOS)
   - Roll back to previous version (Android)

### If High Error Rate

1. Check Sentry for error patterns
2. Check if related to specific feature/endpoint
3. Disable feature if necessary (feature flag)
4. Deploy fix if identified

---

## Common Launch Issues

### Issue: App not appearing in search

**Cause:** App Store indexing delay

**Solution:**
- Wait 24-48 hours for indexing
- Share direct links in the meantime
- iOS: `https://apps.apple.com/app/id[APP_ID]`
- Android: `https://play.google.com/store/apps/details?id=com.yourname.surgicalprep`

### Issue: Users can't sign up

**Check:**
1. Backend is running
2. Auth endpoints responding
3. Email service working (if email verification)
4. No rate limiting triggered

### Issue: Images not loading

**Check:**
1. Supabase Storage bucket is public
2. Image URLs are correct
3. No CORS issues
4. CDN is working

### Issue: Payments not working

**Check:**
1. Stripe is in live mode (not test)
2. Webhook endpoint is receiving events
3. Products/prices are configured correctly
4. Apple/Google IAP is configured (if using native)

---

## Communication Templates

### Social Media Announcement
```
🎉 SurgicalPrep is now available!

The ultimate study companion for surgical techs & OR nurses:
📚 200+ surgical instruments
📋 Digital preference cards
🧠 Flashcards & quizzes

Download now:
🍎 [iOS Link]
🤖 [Android Link]

#surgicaltech #ORnurse #medicaleducation
```

### Beta Tester Thank You Email
```
Subject: SurgicalPrep is Live! 🎉

Hi [Name],

Thanks to your help, SurgicalPrep is officially available in the App Store and Google Play!

Your feedback during beta was invaluable. As a thank you, here's a code for 3 months of free Premium: [CODE]

Download the production version:
- iOS: [Link]
- Android: [Link]

Thank you for being part of this journey!

Best,
[Your name]
```

### Issue Response Template
```
Hi [Name],

Thanks for reporting this issue. We're aware of [ISSUE] and actively working on a fix.

Current status: [STATUS]
Expected resolution: [ETA]

We'll update you as soon as it's resolved. Sorry for any inconvenience.

Best,
SurgicalPrep Support
```

---

## Post-Launch (T+1 day)

### Review Metrics
- [ ] Total downloads
- [ ] New user signups
- [ ] Daily active users
- [ ] Crash rate (target: <1%)
- [ ] Average session duration
- [ ] Top screens viewed

### Review Feedback
- [ ] Check App Store reviews
- [ ] Check Google Play reviews
- [ ] Respond to all reviews (positive and negative)
- [ ] Note feature requests for roadmap
- [ ] Identify critical bugs for hotfix

### Team Debrief
- [ ] What went well?
- [ ] What could be improved?
- [ ] Any surprises?
- [ ] Lessons learned?

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Lead Developer | [Name] | [Phone] | [Email] |
| Backend/DevOps | [Name] | [Phone] | [Email] |
| Support | [Name] | [Phone] | [Email] |

---

## Quick Links

- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Firebase Console: https://console.firebase.google.com
- Sentry: https://sentry.io
- Railway: https://railway.app
- Supabase: https://app.supabase.com
- Stripe: https://dashboard.stripe.com
- UptimeRobot: https://uptimerobot.com

---

## Post-Launch Week 1 TODO

- [ ] Monitor reviews daily
- [ ] Respond to support emails within 24 hours
- [ ] Prepare hotfix for any critical issues
- [ ] Analyze user behavior with analytics
- [ ] Plan first update based on feedback
- [ ] Continue marketing push
- [ ] Reach out to surgical tech communities
- [ ] Write blog post about launch
