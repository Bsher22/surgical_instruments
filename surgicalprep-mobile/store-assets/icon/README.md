# App Icon Requirements

## Overview

Your app icon is the most visible brand element. It appears on the home screen, app store, and throughout the system UI. A well-designed icon is crucial for recognition and downloads.

## Size Requirements

### iOS
| Size | Usage |
|------|-------|
| 1024 x 1024 | App Store |
| 180 x 180 | iPhone @3x |
| 120 x 120 | iPhone @2x |
| 167 x 167 | iPad Pro |
| 152 x 152 | iPad @2x |
| 76 x 76 | iPad |

### Android
| Size | Density |
|------|---------|
| 512 x 512 | Play Store |
| 192 x 192 | xxxhdpi |
| 144 x 144 | xxhdpi |
| 96 x 96 | xhdpi |
| 72 x 72 | hdpi |
| 48 x 48 | mdpi |

## Technical Requirements

### iOS
- **Format**: PNG
- **Color space**: sRGB
- **No transparency**: Alpha channel not allowed
- **No rounded corners**: System applies them automatically
- **Resolution**: 72 DPI minimum

### Android
- **Format**: PNG (32-bit with alpha)
- **Adaptive icon**: Foreground (108x108 safe zone) + Background
- **No rounded corners**: System applies mask automatically

## Design Guidelines

### Do's ✅
- Keep it simple and recognizable at small sizes
- Use distinctive colors that stand out
- Use a single focal element
- Test at multiple sizes (especially 29x29 for small contexts)
- Consider how it looks on light AND dark backgrounds

### Don'ts ❌
- Don't include text (illegible at small sizes)
- Don't use photos (don't scale well)
- Don't include transparency (iOS)
- Don't add your own rounded corners
- Don't make it too detailed

## Icon Concept Ideas for SurgicalPrep

### Option 1: Instrument Silhouette
- Clean silhouette of a surgical instrument (scalpel, forceps, or scissors)
- Medical teal/blue background (#0A5C6B)
- Simple, recognizable, professional

### Option 2: Study Symbol
- Stylized flashcard or book with instrument
- Combines educational + medical themes
- Gradient background for depth

### Option 3: Abstract Medical
- Abstract OR/surgical motif
- Geometric shapes suggesting precision
- Clean, modern look

### Option 4: Monogram
- "SP" stylized letters
- Incorporated into medical symbol
- Simple but branded

## Color Suggestions

Based on your app's theme:
```
Primary: #0A5C6B (Medical Teal)
Accent: #E8F4F6 (Light Teal)
White: #FFFFFF
Dark: #1A1A1A
```

## File Structure

```
icon/
├── icon-1024.png          # Source file (iOS App Store)
├── icon-512.png           # Android Play Store
├── adaptive-icon/
│   ├── foreground.png     # Android adaptive foreground
│   └── background.png     # Android adaptive background
└── source/
    └── icon.fig           # Figma/Sketch source file
```

## Generating Icons

### Using EAS
EAS can generate all icon sizes from your 1024x1024 source:
```bash
# Place your icon in assets/icon.png
# EAS handles the rest during build
```

### Using Tools
- [App Icon Generator](https://appicon.co/) - Free, generates all sizes
- [MakeAppIcon](https://makeappicon.com/) - Multiple platforms
- [Icon Kitchen](https://icon.kitchen/) - Android adaptive icons
- Figma plugins: "iOS App Icon Generator", "Android Asset Generator"

### Manual Generation (ImageMagick)
```bash
# Generate iOS sizes
convert icon-1024.png -resize 180x180 icon-180.png
convert icon-1024.png -resize 120x120 icon-120.png
# ... etc

# Generate Android sizes
convert icon-1024.png -resize 512x512 icon-512.png
convert icon-1024.png -resize 192x192 icon-192.png
# ... etc
```

## Android Adaptive Icons

Android 8.0+ uses adaptive icons with separate foreground and background layers:

### Foreground Layer
- 108 x 108 dp (with 72 x 72 dp safe zone)
- Contains the main icon artwork
- Transparent background
- Centered in the safe zone

### Background Layer
- Solid color or gradient
- Can use your brand color (#0A5C6B)

### Example in app.json
```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon-foreground.png",
      "backgroundColor": "#0A5C6B"
    }
  }
}
```

## Expo Asset Configuration

In your `app.json` or `app.config.ts`:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "ios": {
      "icon": "./assets/icon.png"
    },
    "android": {
      "icon": "./assets/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A5C6B"
      }
    }
  }
}
```

## Checklist

- [ ] 1024x1024 PNG master file created
- [ ] No transparency (for iOS)
- [ ] Icon is recognizable at 29x29
- [ ] Colors work on light and dark backgrounds
- [ ] No text in icon
- [ ] Adaptive icon assets created (Android)
- [ ] Source file saved for future edits
- [ ] Icon placed in assets/ folder
- [ ] app.json/app.config.ts configured

## Resources

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Material Design - Product Icons](https://m3.material.io/styles/icons/overview)
- [Expo Icons Documentation](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
