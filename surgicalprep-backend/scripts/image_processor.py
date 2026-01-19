"""
Image Processing Utility
Stage 9: Content Population

Processes instrument images:
- Resizes to standard dimensions (800x600 primary, 400x300 thumbnail)
- Optimizes file size
- Standardizes format

Usage:
    python -m scripts.image_processor                    # Process all images
    python -m scripts.image_processor --source=path      # Custom source folder
    python -m scripts.image_processor --thumbnails-only  # Only generate thumbnails
"""

import os
import argparse
from pathlib import Path
from typing import Tuple, Optional
import io

try:
    from PIL import Image, ImageOps
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    print("⚠️  Pillow not installed. Run: pip install Pillow")

# Configuration
PRIMARY_SIZE = (800, 600)
THUMBNAIL_SIZE = (400, 300)
MAX_FILE_SIZE_KB = 100
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
OUTPUT_FORMAT = 'PNG'
QUALITY = 85  # For JPEG compression


class ImageProcessor:
    """Processes instrument images for the app."""
    
    def __init__(self, source_dir: Path, output_dir: Path, thumbnail_dir: Path):
        self.source_dir = source_dir
        self.output_dir = output_dir
        self.thumbnail_dir = thumbnail_dir
        self.stats = {
            "processed": 0,
            "skipped": 0,
            "errors": 0
        }
        
    def setup_directories(self):
        """Create output directories if they don't exist."""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.thumbnail_dir.mkdir(parents=True, exist_ok=True)
        print(f"✓ Output directories ready")
        
    def get_source_images(self) -> list:
        """Get list of source image files."""
        if not self.source_dir.exists():
            raise FileNotFoundError(f"Source directory not found: {self.source_dir}")
            
        images = []
        for file in self.source_dir.iterdir():
            if file.suffix.lower() in SUPPORTED_FORMATS:
                images.append(file)
                
        return sorted(images)
    
    def slugify(self, name: str) -> str:
        """Convert filename to URL-safe slug."""
        # Remove extension
        name = Path(name).stem
        # Lowercase and replace spaces/underscores with hyphens
        slug = name.lower().replace(' ', '-').replace('_', '-')
        # Remove any non-alphanumeric characters except hyphens
        slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        # Remove multiple consecutive hyphens
        while '--' in slug:
            slug = slug.replace('--', '-')
        return slug.strip('-')
    
    def resize_and_crop(self, img: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
        """
        Resize image to target size, maintaining aspect ratio and cropping if needed.
        Uses center crop to fit exact dimensions.
        """
        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Use ImageOps.fit for center crop to exact dimensions
        return ImageOps.fit(img, target_size, Image.Resampling.LANCZOS)
    
    def optimize_image(self, img: Image.Image, max_size_kb: int = MAX_FILE_SIZE_KB) -> bytes:
        """Optimize image to target file size."""
        output = io.BytesIO()
        
        # Try PNG first
        img.save(output, format='PNG', optimize=True)
        
        # If too large, try JPEG with decreasing quality
        if output.tell() > max_size_kb * 1024:
            quality = QUALITY
            while quality > 20:
                output = io.BytesIO()
                img.save(output, format='JPEG', quality=quality, optimize=True)
                if output.tell() <= max_size_kb * 1024:
                    break
                quality -= 10
                
        return output.getvalue()
    
    def process_image(
        self, 
        source_path: Path, 
        skip_primary: bool = False
    ) -> Tuple[Optional[Path], Optional[Path]]:
        """
        Process a single image.
        Returns (primary_path, thumbnail_path) or (None, None) on error.
        """
        slug = self.slugify(source_path.name)
        
        try:
            with Image.open(source_path) as img:
                # Process primary image
                primary_path = None
                if not skip_primary:
                    primary_img = self.resize_and_crop(img, PRIMARY_SIZE)
                    primary_data = self.optimize_image(primary_img)
                    
                    ext = '.jpg' if primary_data[:2] == b'\xff\xd8' else '.png'
                    primary_path = self.output_dir / f"{slug}{ext}"
                    
                    with open(primary_path, 'wb') as f:
                        f.write(primary_data)
                        
                # Process thumbnail
                thumb_img = self.resize_and_crop(img, THUMBNAIL_SIZE)
                thumb_data = self.optimize_image(thumb_img, max_size_kb=50)
                
                ext = '.jpg' if thumb_data[:2] == b'\xff\xd8' else '.png'
                thumbnail_path = self.thumbnail_dir / f"{slug}{ext}"
                
                with open(thumbnail_path, 'wb') as f:
                    f.write(thumb_data)
                    
                return primary_path, thumbnail_path
                
        except Exception as e:
            print(f"    ❌ Error processing {source_path.name}: {e}")
            return None, None
    
    def process_all(self, thumbnails_only: bool = False):
        """Process all source images."""
        self.setup_directories()
        
        images = self.get_source_images()
        print(f"Found {len(images)} images to process\n")
        
        for i, source_path in enumerate(images):
            print(f"[{i+1}/{len(images)}] Processing: {source_path.name}")
            
            primary_path, thumb_path = self.process_image(
                source_path, 
                skip_primary=thumbnails_only
            )
            
            if thumb_path:
                self.stats["processed"] += 1
                
                # Report file sizes
                if primary_path:
                    primary_size = primary_path.stat().st_size / 1024
                    thumb_size = thumb_path.stat().st_size / 1024
                    print(f"    ✓ Primary: {primary_size:.1f}KB, Thumb: {thumb_size:.1f}KB")
                else:
                    thumb_size = thumb_path.stat().st_size / 1024
                    print(f"    ✓ Thumbnail: {thumb_size:.1f}KB")
            else:
                self.stats["errors"] += 1
                
        self.print_stats()
        
    def print_stats(self):
        """Print processing statistics."""
        print("\n" + "="*50)
        print("IMAGE PROCESSING STATISTICS")
        print("="*50)
        print(f"  Processed: {self.stats['processed']}")
        print(f"  Skipped:   {self.stats['skipped']}")
        print(f"  Errors:    {self.stats['errors']}")
        print("="*50)


def main():
    if not PILLOW_AVAILABLE:
        print("❌ Pillow is required. Install with: pip install Pillow")
        return
        
    parser = argparse.ArgumentParser(description="Process instrument images")
    parser.add_argument("--source", type=str, help="Source images directory")
    parser.add_argument("--output", type=str, help="Output directory for processed images")
    parser.add_argument("--thumbnails", type=str, help="Output directory for thumbnails")
    parser.add_argument("--thumbnails-only", action="store_true", help="Only generate thumbnails")
    
    args = parser.parse_args()
    
    # Set up paths
    data_dir = Path(__file__).parent / "data"
    source_dir = Path(args.source) if args.source else data_dir / "images" / "source"
    output_dir = Path(args.output) if args.output else data_dir / "images" / "processed"
    thumb_dir = Path(args.thumbnails) if args.thumbnails else data_dir / "images" / "thumbnails"
    
    processor = ImageProcessor(source_dir, output_dir, thumb_dir)
    
    try:
        processor.process_all(thumbnails_only=args.thumbnails_only)
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print(f"\nCreate the source directory and add images:")
        print(f"  mkdir -p {source_dir}")


if __name__ == "__main__":
    main()
