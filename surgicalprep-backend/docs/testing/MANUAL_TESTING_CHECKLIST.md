# SurgicalPrep - Manual Testing Checklist

## Overview

This document provides a comprehensive checklist for manual QA testing of the SurgicalPrep mobile application. Complete each section before release.

**Testing Environment:**
- iOS Simulator / Physical Device: _______________
- Android Emulator / Physical Device: _______________
- Backend Environment: _______________
- Tester Name: _______________
- Date: _______________
- App Version: _______________

---

## 1. Authentication Flow

### 1.1 Registration
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Valid registration | Enter valid email, password (8+ chars), name, select role | Account created, redirected to app | | |
| Duplicate email | Try registering with existing email | Error message shown | | |
| Invalid email format | Enter "notanemail" as email | Validation error shown | | |
| Weak password | Enter password < 8 characters | Validation error shown | | |
| Missing required fields | Leave fields empty, submit | Appropriate error messages | | |
| Role selection | Select each role option | Role saved correctly | | |
| Institution field | Enter institution name (optional) | Saved correctly | | |

### 1.2 Login
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Valid login | Enter valid credentials | Login successful, redirected to main app | | |
| Wrong password | Enter correct email, wrong password | Error: "Invalid credentials" | | |
| Non-existent email | Enter unregistered email | Error: "Invalid credentials" | | |
| Case insensitive email | Login with email in different case | Login successful | | |
| Empty fields | Submit with empty email/password | Validation errors shown | | |
| Password visibility toggle | Tap eye icon | Password shown/hidden | | |
| Remember session | Login, close app, reopen | Still logged in | | |

### 1.3 Token Management
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Token refresh | Wait for token expiry, make request | Token refreshes automatically | | |
| Expired refresh token | Set expired refresh token | Redirected to login | | |
| Logout | Tap logout button | Tokens cleared, redirected to login | | |
| Session persistence | Login, force close app, reopen | Session restored | | |

### 1.4 Password Reset
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Request reset | Enter valid email, request reset | Success message (check email) | | |
| Non-existent email | Enter unregistered email | Same success message (security) | | |

---

## 2. Instruments Feature

### 2.1 Instrument List
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| List loads | Navigate to instruments tab | List displays with images | | |
| Pull to refresh | Pull down on list | Data refreshes | | |
| Infinite scroll | Scroll to bottom | More instruments load | | |
| Loading skeleton | First load / slow network | Skeleton placeholders shown | | |
| Empty state | (If no instruments) | Appropriate empty message | | |

### 2.2 Search
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Search by name | Type "Mayo" in search | Mayo Scissors found | | |
| Search by alias | Type "Metz" in search | Metzenbaum Scissors found | | |
| No results | Search "xyznotfound" | "No results" message | | |
| Clear search | Tap X or clear text | Full list restored | | |
| Search debounce | Type quickly | No excessive API calls | | |

### 2.3 Category Filter
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Filter by category | Tap "Cutting" chip | Only cutting instruments shown | | |
| Multiple categories | Select multiple chips | Combined results shown | | |
| Clear filters | Deselect all chips | Full list shown | | |
| Filter + Search | Apply filter, then search | Combined filtering works | | |

### 2.4 Instrument Detail
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View detail | Tap on instrument card | Detail screen opens | | |
| Image loads | View detail screen | Image displays correctly | | |
| Image zoom | Pinch/tap on image | Image zooms | | |
| All fields shown | Scroll detail screen | Name, description, uses, procedures, notes visible | | |
| Back navigation | Tap back button | Returns to list | | |

### 2.5 Bookmarking
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Bookmark instrument | Tap bookmark icon | Icon fills, instrument saved | | |
| Unbookmark | Tap filled bookmark | Icon empties, removed from saved | | |
| View bookmarks | Navigate to bookmarks section | Saved instruments shown | | |
| Bookmark persists | Bookmark, close app, reopen | Bookmark still saved | | |

### 2.6 Premium Content
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Free user - premium instrument | View premium instrument as free user | Lock overlay / limited info | | |
| Premium user - premium instrument | View as premium user | Full content visible | | |

---

## 3. Preference Cards Feature

### 3.1 Card List
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| List loads | Navigate to cards tab | User's cards displayed | | |
| Empty state | New user with no cards | "Create First Card" CTA shown | | |
| Card preview | View card in list | Title, item count, last updated visible | | |
| Search cards | Search by procedure/surgeon | Matching cards filtered | | |
| Filter by specialty | Select specialty filter | Cards filtered correctly | | |

### 3.2 View Card
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Open card | Tap card in list | Card detail screen opens | | |
| Header info | View card header | Title, surgeon, procedure shown | | |
| Grouped items | View items section | Items grouped by category | | |
| Item details | View item row | Name, quantity, size, notes shown | | |
| Tap instrument | Tap instrument item | Navigates to instrument detail | | |
| Photos carousel | Swipe through photos | Photos display correctly | | |
| Notes sections | Scroll to notes | General and setup notes visible | | |

### 3.3 Create Card
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Open create form | Tap "+" or "Create Card" | Form opens | | |
| Required fields | Submit without title | Validation error | | |
| Fill basic info | Enter title, surgeon, procedure, specialty | Fields saved | | |
| Add instrument item | Search and select instrument | Item added to list | | |
| Add custom item | Tap "Add Custom", fill details | Custom item added | | |
| Edit item quantity | Change quantity value | Value updates | | |
| Edit item size | Change size value | Value updates | | |
| Add item notes | Enter notes for item | Notes saved | | |
| Reorder items | Drag item to new position | Order changes | | |
| Delete item | Swipe to delete / tap delete | Item removed | | |
| Add photo (camera) | Tap camera, take photo | Photo added to card | | |
| Add photo (gallery) | Tap gallery, select image | Photo added to card | | |
| Delete photo | Tap X on photo | Photo removed | | |
| Save card | Tap Save button | Card created, navigate to detail | | |
| Cancel create | Tap Cancel | Confirm discard, return to list | | |

### 3.4 Edit Card
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Open edit | Tap Edit on card detail | Edit form opens with data | | |
| Modify title | Change title, save | Title updated | | |
| Add new item | Add item to existing card | Item added | | |
| Remove item | Delete existing item | Item removed | | |
| Modify item | Change quantity/notes | Changes saved | | |
| Save changes | Tap Save | Card updated | | |
| Cancel edit | Tap Cancel | Confirm discard changes | | |

### 3.5 Delete Card
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Delete card | Tap delete, confirm | Card removed from list | | |
| Cancel delete | Tap delete, cancel | Card remains | | |

### 3.6 Duplicate Card
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Duplicate card | Tap duplicate button | Copy created with "(Copy)" suffix | | |
| Edit duplicate | Open duplicated card | All items copied, editable | | |

### 3.7 Free Tier Limits
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Card count display | View cards list header | "X/5 cards used" shown | | |
| Create at limit | Try to create 6th card as free user | Error with upgrade prompt | | |
| Premium no limit | Create 6+ cards as premium user | No limit enforced | | |

---

## 4. Quiz & Study Feature

### 4.1 Quiz Home
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Stats display | View quiz home | Instruments studied, avg score, streak shown | | |
| Due for review count | View home | Due count accurate | | |
| Quick actions | View action buttons | Review Due, Quick 10, Full Quiz available | | |
| Quiz history | View history section | Past quizzes listed | | |

### 4.2 Flashcard Mode
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Start session | Tap flashcard mode | Session starts with cards | | |
| Card front | View card | Instrument image shown | | |
| Tap to flip | Tap card | Card flips to show name/info | | |
| Flip animation | Flip card | Smooth flip animation | | |
| Swipe right | Swipe card right | "Got it" recorded, next card | | |
| Swipe left | Swipe card left | "Study more" recorded, next card | | |
| Progress indicator | During session | Shows X/Y progress | | |
| Session complete | Finish all cards | Summary screen shown | | |
| Results accuracy | View summary | Correct counts match actions | | |

### 4.3 Multiple Choice Quiz
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Start quiz | Tap multiple choice option | Quiz starts with questions | | |
| Question display | View question | Image/text and 4 options shown | | |
| Select answer | Tap option | Option highlighted | | |
| Correct feedback | Answer correctly | Green indicator, explanation | | |
| Incorrect feedback | Answer wrong | Red indicator, shows correct answer | | |
| Timer (if enabled) | Start timed quiz | Timer counts down | | |
| Timer expiry | Let timer run out | Question auto-advances or ends | | |
| Progress bar | During quiz | Progress updates with each question | | |
| Results screen | Complete quiz | Score, breakdown shown | | |
| Review mistakes | Tap "Review Mistakes" | Incorrect questions shown | | |

### 4.4 Quiz Settings
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Question count | Set to 20 questions | Quiz has 20 questions | | |
| Timer toggle | Enable/disable timer | Timer shown/hidden accordingly | | |
| Category filter | Select specific category | Only that category's instruments | | |

### 4.5 Spaced Repetition
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Due for review | Study instrument, wait for due date | Shows in "Due for Review" | | |
| Interval increase | Answer correctly multiple times | Review interval increases | | |
| Interval reset | Answer incorrectly | Review interval resets | | |

### 4.6 Free Tier Quiz Limits
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Daily limit display | View quiz home as free user | "X/3 quizzes today" shown | | |
| Limit reached | Complete 3 quizzes | 4th quiz blocked with upgrade prompt | | |
| Limit resets | Check after midnight | Count reset to 0 | | |
| Premium no limit | Complete 5+ quizzes as premium | No limit enforced | | |

---

## 5. Profile & Settings

### 5.1 Profile Screen
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| View profile | Navigate to profile tab | Name, email, role, institution shown | | |
| Edit profile | Tap edit, change name | Name updated | | |
| Subscription status | View subscription card | Correct tier shown | | |
| Usage stats | View stats section | Cards created, instruments studied, quizzes shown | | |

### 5.2 Settings
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Quiz settings | Change default question count | Setting saved | | |
| Timer preference | Toggle timer default | Setting saved | | |
| Dark mode | Toggle dark mode | Theme changes | | |
| Version number | View About section | Correct version shown | | |
| Privacy policy | Tap Privacy Policy | Opens in browser | | |
| Terms of service | Tap Terms | Opens in browser | | |

### 5.3 Account Actions
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Change password | Enter current, new password | Password changed | | |
| Logout | Tap logout | Logged out, data cleared | | |
| Delete account | Tap delete, confirm | Account deleted | | |
| Delete cancel | Tap delete, cancel | Account remains | | |

---

## 6. Edge Cases & Error Handling

### 6.1 Network Errors
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Offline mode | Disable network, browse app | Offline banner shown | | |
| API error | (Simulate 500 error) | Error toast shown | | |
| Retry logic | Fail request, then restore network | Request retries successfully | | |
| Timeout | (Simulate slow response) | Timeout message after threshold | | |

### 6.2 Empty States
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| No instruments match | Search with no results | "No instruments found" message | | |
| No cards | New user views cards | "Create your first card" CTA | | |
| No quiz history | New user views quiz home | Appropriate empty state | | |
| No bookmarks | View bookmarks with none saved | "No bookmarks yet" message | | |

### 6.3 Input Edge Cases
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Very long text | Enter 1000+ char note | Text handled appropriately | | |
| Special characters | Enter emojis, unicode | Displayed correctly | | |
| Rapid taps | Tap button multiple times quickly | Only one action triggered | | |
| Large image upload | Upload 10MB+ image | Resized/error handled | | |

---

## 7. Platform-Specific Tests

### 7.1 iOS
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Safe area | View on iPhone with notch | Content doesn't overlap notch | | |
| Home indicator | View bottom of screen | Content doesn't overlap indicator | | |
| Haptic feedback | Complete quiz, bookmark | Haptic feedback felt | | |
| Share sheet | (If implemented) | iOS share sheet opens | | |
| Keyboard avoiding | Open form with keyboard | Form scrolls appropriately | | |

### 7.2 Android
| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Back button | Press hardware back | Expected navigation behavior | | |
| Status bar | View app | Status bar styled correctly | | |
| Navigation bar | View bottom nav area | No overlap with system nav | | |
| Permissions | Request camera permission | Dialog shows, permission handled | | |

---

## 8. Performance

| Test Case | Steps | Expected Result | Pass/Fail | Notes |
|-----------|-------|-----------------|-----------|-------|
| Initial load time | Cold start app | < 3 seconds to interactive | | |
| List scroll | Scroll instrument list quickly | No jank, smooth 60fps | | |
| Image loading | Browse instruments | Images load promptly | | |
| Memory usage | Use app for 10+ minutes | No memory warnings | | |
| Background/foreground | Minimize and restore app | State preserved, no crash | | |

---

## Sign-Off

**Testing Complete:** [ ] Yes  [ ] No

**Critical Bugs Found:** _______

**Recommended for Release:** [ ] Yes  [ ] No - Reason: _______

**Tester Signature:** _______________________ **Date:** _______

**QA Lead Approval:** _______________________ **Date:** _______
