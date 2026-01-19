# Image Guidelines for SurgicalPrep

This document outlines specifications and best practices for instrument images in SurgicalPrep.

---

## Image Specifications

### Primary Images
| Property | Specification |
|----------|---------------|
| Dimensions | 800 x 600 pixels |
| Aspect Ratio | 4:3 |
| Format | PNG (preferred) or JPEG |
| Color Mode | RGB |
| Background | White (#FFFFFF) or neutral gray (#F5F5F5) |
| File Size | < 100KB (optimized) |

### Thumbnails
| Property | Specification |
|----------|---------------|
| Dimensions | 400 x 300 pixels |
| Aspect Ratio | 4:3 |
| Format | PNG (preferred) or JPEG |
| File Size | < 50KB (optimized) |

### File Naming Convention
```
instrument-name-in-lowercase-with-hyphens.png
```

**Examples:**
- `kelly-hemostatic-forceps.png`
- `metzenbaum-scissors.png`
- `army-navy-retractor.png`

---

## Photography Guidelines

### Composition

#### Orientation
- **Horizontal preferred** for most instruments
- Instrument should fill 70-80% of frame
- Center the instrument with even margins

#### Positioning
- Lay instruments flat when possible
- Show the instrument in its "natural" resting position
- For multi-part instruments (like retractors), show assembled
- Open position for scissors and forceps to show jaw pattern

```
Good Examples:
┌─────────────────────────────────┐
│                                 │
│     ═══════════════════>        │  ← Horizontal, centered
│                                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│                                 │
│         <═══╱                   │  ← Shows scissor jaws open
│              ╲═══>              │
│                                 │
└─────────────────────────────────┘
```

#### Angle
- Shoot from directly above (bird's eye view)
- Or slight angle (15-30°) to show depth
- Avoid extreme angles that distort shape

### Lighting

#### Requirements
- Even, diffused lighting
- No harsh shadows
- No hot spots or reflections
- Consistent across all images

#### Setup Tips
- Use softbox or light tent
- Two light sources at 45° angles
- White reflector cards to fill shadows
- Avoid direct flash

### Background

#### Standard Background
- Pure white (#FFFFFF) - preferred
- Neutral gray (#F5F5F5) - acceptable
- Matte finish to prevent reflections

#### What to Avoid
- ❌ Colored backgrounds
- ❌ Patterned or textured backgrounds
- ❌ Visible shadows
- ❌ Other objects in frame
- ❌ Hands or gloves holding instrument

### Focus

- Entire instrument should be in sharp focus
- Use small aperture (f/8-f/11) for depth of field
- Use tripod for sharpness
- Focus on the working end of the instrument

---

## Post-Processing Workflow

### Step 1: Raw Processing
1. Adjust exposure if needed
2. Correct white balance to neutral
3. Export at high resolution

### Step 2: Background Cleanup
1. Remove any visible background imperfections
2. Ensure pure white background
3. Remove dust spots from instrument

### Step 3: Resize
```
Primary: 800 x 600 px
Thumbnail: 400 x 300 px
```

**Using ImageMagick:**
```bash
# Resize to primary
convert source.jpg -resize 800x600 -gravity center -extent 800x600 -background white primary.png

# Generate thumbnail
convert primary.png -resize 400x300 thumbnail.png
```

**Using Python/Pillow:**
```python
from PIL import Image, ImageOps

# Open and resize
img = Image.open('source.jpg')
img = ImageOps.fit(img, (800, 600), Image.LANCZOS)
img.save('primary.png')
```

### Step 4: Optimization
Target file sizes:
- Primary: < 100KB
- Thumbnail: < 50KB

**Using TinyPNG/TinyJPG:**
- Upload to tinypng.com
- Download optimized version

**Using ImageOptim (Mac):**
- Drag files into ImageOptim
- Wait for automatic optimization

**Using Command Line:**
```bash
# PNG optimization with pngquant
pngquant --quality=65-80 image.png

# JPEG optimization with jpegoptim
jpegoptim --max=80 image.jpg
```

### Step 5: Quality Check
Before uploading, verify:
- [ ] Dimensions correct (800x600 / 400x300)
- [ ] File size within limits
- [ ] Background is pure white
- [ ] Instrument clearly visible
- [ ] No artifacts or compression issues
- [ ] Filename follows convention

---

## Image Sources

### Creating Original Photos
**Best option for:**
- Unique, copyright-free content
- Consistent style across all images
- Full control over quality

**Equipment Needed:**
- DSLR or high-quality phone camera
- Light tent or softbox setup
- Tripod
- White background material

### Stock Medical Images
**Considerations:**
- Verify license allows commercial use
- Check for required attribution
- Ensure consistent style is possible
- Higher cost but saves production time

**Sources:**
- Shutterstock (medical category)
- Getty Images
- Adobe Stock
- Alamy

### Manufacturer Catalogs
**Considerations:**
- Many are public domain for educational use
- Contact manufacturer for permission
- Quality varies significantly
- May require background removal

**Major Catalogs:**
- Sklar Instruments
- Integra LifeSciences
- V. Mueller (BD)
- Teleflex Medical

### Important: Copyright Compliance
- Never use images without proper rights
- Document source and license for each image
- When in doubt, create original content
- Keep license documentation on file

---

## Directory Structure

```
scripts/data/images/
├── source/              # Original high-resolution images
│   ├── kelly-hemostatic-forceps.jpg
│   ├── mayo-scissors-curved.jpg
│   └── ...
├── processed/           # Resized 800x600 images
│   ├── kelly-hemostatic-forceps.png
│   ├── mayo-scissors-curved.png
│   └── ...
└── thumbnails/          # Resized 400x300 images
    ├── kelly-hemostatic-forceps.png
    ├── mayo-scissors-curved.png
    └── ...
```

---

## Batch Processing Script

Use the provided `image_processor.py` script:

```bash
# Process all images in source directory
python -m scripts.image_processor

# Process specific source directory
python -m scripts.image_processor --source=/path/to/images

# Generate only thumbnails (from already processed images)
python -m scripts.image_processor --thumbnails-only
```

---

## Supabase Storage Structure

```
instrument-images/           # Bucket name
├── primary/                 # Full-size images
│   ├── kelly-hemostatic-forceps.png
│   ├── mayo-scissors-curved.png
│   └── ...
└── thumbnails/              # Thumbnail images
    ├── kelly-hemostatic-forceps.png
    ├── mayo-scissors-curved.png
    └── ...
```

### Storage Policies
```sql
-- Public read access for all users
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'instrument-images');

-- Authenticated write access (for admin uploads)
CREATE POLICY "Authenticated write access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'instrument-images' AND auth.role() = 'authenticated');
```

---

## Quality Checklist

Before uploading images to production:

### Technical Requirements
- [ ] Primary image is exactly 800x600 pixels
- [ ] Thumbnail is exactly 400x300 pixels
- [ ] File size under 100KB (primary) / 50KB (thumbnail)
- [ ] PNG or JPEG format
- [ ] Filename follows naming convention

### Visual Quality
- [ ] Instrument is clearly identifiable
- [ ] Entire instrument is visible
- [ ] Sharp focus throughout
- [ ] No blur or motion artifacts
- [ ] Proper exposure (not too dark/bright)

### Background & Composition
- [ ] Pure white or neutral gray background
- [ ] No shadows visible
- [ ] No reflections or hot spots
- [ ] Instrument centered in frame
- [ ] Appropriate padding/margins

### Content Accuracy
- [ ] Image matches the correct instrument
- [ ] Filename matches instrument name in database
- [ ] Both primary and thumbnail exist

---

## Common Issues and Solutions

### Issue: Background Not Pure White
**Solution:** Use levels adjustment to push background to #FFFFFF, or re-photograph with better lighting.

### Issue: Reflections on Metal
**Solution:** Use polarizing filter, matte spray (if appropriate), or diffused lighting.

### Issue: Instrument Appears Distorted
**Solution:** Photograph from directly above or use longer focal length to reduce perspective distortion.

### Issue: File Size Too Large
**Solution:** Increase compression, reduce quality slightly, or switch from PNG to JPEG for photographic images.

### Issue: Inconsistent Style Across Images
**Solution:** Process all images with same settings, use same lighting setup, create style guide for consistency.

---

## Tools Recommended

### Photography
- Adobe Lightroom (processing)
- Capture One (professional alternative)
- GIMP (free alternative)

### Image Processing
- Adobe Photoshop
- GIMP (free)
- Python + Pillow (scripted processing)
- ImageMagick (command line)

### Optimization
- TinyPNG / TinyJPG (web)
- ImageOptim (Mac)
- pngquant / jpegoptim (command line)

### Batch Processing
- Adobe Bridge + Photoshop
- Lightroom Export
- Python scripts (included in this package)
