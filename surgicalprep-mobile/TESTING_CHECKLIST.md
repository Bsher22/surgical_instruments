# Stage 10 Testing Checklist

Use this checklist to verify all Stage 10 polish and performance improvements are working correctly.

---

## 10A: Performance

### Image Optimization
- [ ] Images load from cache on second view
- [ ] Placeholder (blurhash) shows during image load
- [ ] Images transition smoothly from placeholder to loaded
- [ ] Large images don't cause memory warnings
- [ ] Image quality is acceptable at different sizes

### List Performance
- [ ] Instrument list scrolls smoothly at 60fps
- [ ] Cards list scrolls without jank
- [ ] No visible flickering during scroll
- [ ] Pull-to-refresh works smoothly
- [ ] Infinite scroll loads without freeze

### React Query Caching
- [ ] Previously viewed data loads instantly
- [ ] Stale data shows while fresh data loads
- [ ] Cache invalidates correctly after mutations
- [ ] Offline mode shows cached data

### Bundle Size
- [ ] App bundle is under 10MB (iOS)
- [ ] App bundle is under 15MB (Android)
- [ ] No unused dependencies in bundle

---

## 10B: Error Handling

### Error Boundary
- [ ] App doesn't crash on component errors
- [ ] Error screen shows with "Try Again" button
- [ ] "Try Again" resets the error state
- [ ] Errors are logged (check console in dev)

### Toast Notifications
- [ ] Success toasts appear and auto-dismiss
- [ ] Error toasts appear and stay longer
- [ ] Warning toasts appear with correct styling
- [ ] Info toasts appear with correct styling
- [ ] Swipe up dismisses toasts
- [ ] Tap X dismisses toasts
- [ ] Max 3 toasts visible at once
- [ ] Toasts queue properly

### API Error Handling
- [ ] 400 errors show validation message
- [ ] 401 errors redirect to login
- [ ] 403 errors show access denied or premium prompt
- [ ] 404 errors show not found message
- [ ] 422 errors show field validation errors
- [ ] 429 errors show rate limit warning
- [ ] 500+ errors show server error message
- [ ] Network errors show connection error

### Offline Detection
- [ ] Banner appears when going offline
- [ ] Banner shows correct message
- [ ] Retry button works
- [ ] Banner dismisses when back online
- [ ] Haptic feedback on offline

---

## 10C: UI Polish

### Design System
- [ ] Spacing is consistent throughout app
- [ ] Typography is consistent
- [ ] Colors match the theme
- [ ] Border radii are consistent
- [ ] Shadows render correctly

### Loading States
- [ ] Loading spinner appears during async operations
- [ ] Skeleton loaders show while lists load
- [ ] Full screen loader shows on app init
- [ ] Button loading state shows during submission

### Haptic Feedback
- [ ] Buttons trigger light haptic
- [ ] Tab selection triggers haptic
- [ ] Card flip triggers medium haptic
- [ ] Quiz correct answer triggers success haptic
- [ ] Quiz wrong answer triggers error haptic
- [ ] Swipe gestures trigger haptic
- [ ] Delete actions trigger warning haptic
- [ ] Pull-to-refresh triggers haptic

### Keyboard Handling
- [ ] Keyboard doesn't cover input fields
- [ ] Tap outside dismisses keyboard
- [ ] Scroll view adjusts for keyboard
- [ ] "Done" button appears on iOS keyboard
- [ ] Form submits on return key (where appropriate)

### Safe Areas
- [ ] Content doesn't go under status bar
- [ ] Content doesn't go under home indicator
- [ ] Tab bar spacing is correct
- [ ] Header spacing is correct
- [ ] Notch is handled correctly

### Pull-to-Refresh
- [ ] All list screens support pull-to-refresh
- [ ] Refresh indicator appears
- [ ] Haptic triggers on pull
- [ ] Data reloads on refresh

---

## 10D: Accessibility

### Screen Reader (VoiceOver/TalkBack)
- [ ] All buttons have accessibility labels
- [ ] All images have alt text
- [ ] Headers are announced as headers
- [ ] Lists announce item counts
- [ ] Forms are navigable
- [ ] Modals trap focus

### Touch Targets
- [ ] All buttons are at least 44x44 points
- [ ] Small icons have hit slop
- [ ] Touch targets don't overlap

### Color Contrast
- [ ] Text meets WCAG AA (4.5:1)
- [ ] Large text meets WCAG AA (3:1)
- [ ] UI components meet contrast requirements
- [ ] Error states are distinguishable

### Font Scaling
- [ ] App respects system font size
- [ ] Large fonts don't break layout
- [ ] Text remains readable at all sizes
- [ ] Maximum scale doesn't cause overflow

### Reduce Motion
- [ ] Animations disabled when reduce motion enabled
- [ ] Transitions still feel smooth
- [ ] No essential info lost without animation

---

## Device Testing

### iOS
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 (standard)
- [ ] iPhone 14 Pro Max (large screen)
- [ ] iPad (if supported)

### Android
- [ ] Small phone (5" screen)
- [ ] Standard phone (6" screen)
- [ ] Large phone (6.7" screen)
- [ ] Tablet (if supported)

### OS Versions
- [ ] iOS 15.0
- [ ] iOS 16.0
- [ ] iOS 17.0
- [ ] Android 11
- [ ] Android 12
- [ ] Android 13
- [ ] Android 14

---

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Cold start time | < 3s | |
| List scroll FPS | 60 | |
| Image load time | < 500ms | |
| API response time | < 1s | |
| Memory usage | < 200MB | |
| Battery impact | Minimal | |

---

## Sign-off

- [ ] All tests pass
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Ready for Stage 11

Tested by: _______________
Date: _______________
