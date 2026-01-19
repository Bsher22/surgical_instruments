# Screenshot Requirements

## Overview

Screenshots are crucial for app store conversion. They're often the first thing potential users see and significantly impact download rates.

## Required Screenshots

### iOS (App Store)

| Device | Size (px) | Required | Recommended |
|--------|-----------|----------|-------------|
| iPhone 6.7" (15 Pro Max) | 1290 x 2796 | 3 | 5-8 |
| iPhone 6.5" (14 Plus) | 1284 x 2778 | 3 | 5-8 |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | 3 | 5-8 |
| iPad Pro 12.9" | 2048 x 2732 | 3 | 5-8 |

### Android (Google Play)

| Device | Size (px) | Required | Maximum |
|--------|-----------|----------|---------|
| Phone | 1080 x 1920 | 2 | 8 |
| 7" Tablet | 1200 x 1920 | 0 | 8 |
| 10" Tablet | 1920 x 1200 | 0 | 8 |

## Recommended Screenshot Content

Create 5-8 screenshots showing key features:

### 1. Instrument Browser (hero screenshot)
- Show the instrument list with categories visible
- Include search bar
- Display category filter chips
- Show 4-5 instrument cards with images

### 2. Instrument Detail
- Full instrument image (hero section)
- Name and category badge visible
- Description text
- Primary uses list

### 3. Preference Cards List
- Show 3-4 preference cards
- Display card titles and metadata
- Show "Create New" button
- Include empty state if needed

### 4. Preference Card Editor
- Form with fields populated
- Show item list with instruments
- Category organization visible
- Photo section (if applicable)

### 5. Flashcard Study Mode
- Show a flashcard mid-swipe
- Progress indicator visible
- Clear "Got it" / "Study more" hints

### 6. Multiple Choice Quiz
- Question with instrument image
- 4 answer options visible
- Timer (if enabled)
- Progress bar

### 7. Quiz Results
- Score percentage displayed prominently
- Breakdown by category
- "Review Mistakes" option
- Celebratory UI for good scores

### 8. Profile/Progress
- Stats dashboard
- Study streak
- Progress charts
- Premium badge (if showing premium features)

## Screenshot Best Practices

### Design Tips
- Use clean, uncluttered screens
- Show real (or realistic) content, not placeholder text
- Use consistent framing across all screenshots
- Consider adding text overlays to highlight features
- Use a consistent color scheme that matches your brand

### Technical Requirements
- PNG or JPEG format
- No alpha channel (no transparency)
- Status bar can be included or cropped
- Portrait orientation for most screens

### Creating Screenshots

#### Option 1: Simulator Screenshots
```bash
# iOS Simulator
# Run app in simulator, then:
# Cmd + S to save screenshot
# Or: Device > Screenshot

# Android Emulator
# Click camera icon in emulator toolbar
# Or: adb shell screencap /sdcard/screenshot.png
```

#### Option 2: Device Screenshots
- Run the app on actual devices
- Take screenshots using device controls
- Transfer to computer

#### Option 3: Screenshot Tools
- [Shotbot](https://shotbot.io/) - Automated screenshot generation
- [AppMockUp](https://app-mockup.com/) - Device frame mockups
- [LaunchMatic](https://launchmatic.app/) - Screenshot designer
- [Screenshot Studio](https://screenshotstudio.com/)

### Screenshot Frames (Optional but Recommended)

Adding device frames makes screenshots more professional:

```
+------------------+
|    Title Text    |
|                  |
| +--------------+ |
| |              | |
| |  Screenshot  | |
| |              | |
| +--------------+ |
|                  |
+------------------+
```

Use tools like:
- Figma (templates available)
- Canva
- Adobe XD
- Screenshots.pro

## File Organization

```
screenshots/
├── ios/
│   ├── 6.7-inch/
│   │   ├── 01_instruments.png
│   │   ├── 02_detail.png
│   │   ├── 03_cards.png
│   │   ├── 04_flashcard.png
│   │   └── 05_quiz.png
│   ├── 6.5-inch/
│   │   └── (same files)
│   ├── 5.5-inch/
│   │   └── (same files)
│   └── ipad-12.9/
│       └── (same files)
└── android/
    ├── phone/
    │   └── (same files)
    └── tablet/
        └── (same files, landscape where appropriate)
```

## Localization (Future)

If you plan to localize the app:
- Create separate screenshot sets per language
- Localize any text overlays
- Consider cultural differences in design expectations

## Checklist

- [ ] 5+ screenshots per required device size
- [ ] Screenshots show real/realistic content
- [ ] First screenshot is most compelling (hero shot)
- [ ] Text is readable at thumbnail size
- [ ] Screenshots tell a story of the app's features
- [ ] No placeholder text or "Lorem ipsum"
- [ ] Correct dimensions for each device
- [ ] Consistent visual style across all screenshots
- [ ] Feature graphic created (Android, 1024x500)
