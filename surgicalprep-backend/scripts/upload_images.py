"""
Supabase Storage Image Upload Script
Stage 9: Content Population

Uploads processed images to Supabase Storage and updates database with URLs.

Usage:
    python -m scripts.upload_images                    # Upload all images
    python -m scripts.upload_images --instrument=x    # Upload specific instrument
    python -m scripts.upload_images --update-db       # Only update DB URLs
"""

import asyncio
import argparse
import os
import mimetypes
from pathlib import Path
from typing import Optional, Tuple

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  Supabase client not installed. Run: pip install supabase")

load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "instrument-images")

DATA_DIR = Path(__file__).parent / "data"
PROCESSED_DIR = DATA_DIR / "images" / "processed"
THUMBNAILS_DIR = DATA_DIR / "images" / "thumbnails"


class ImageUploader:
    """Uploads images to Supabase Storage."""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.engine = None
        self.async_session = None
        self.stats = {
            "uploaded": 0,
            "skipped": 0,
            "db_updated": 0,
            "errors": 0
        }
        
    def connect_supabase(self):
        """Initialize Supabase client."""
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
            
        self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✓ Connected to Supabase")
        
    async def connect_db(self):
        """Initialize database connection."""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL must be set")
            
        self.engine = create_async_engine(DATABASE_URL, echo=False)
        self.async_session = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        print("✓ Connected to database")
        
    async def disconnect_db(self):
        """Close database connection."""
        if self.engine:
            await self.engine.dispose()
            
    def get_content_type(self, file_path: Path) -> str:
        """Determine content type from file extension."""
        content_type, _ = mimetypes.guess_type(str(file_path))
        return content_type or 'application/octet-stream'
    
    def file_exists_in_storage(self, path: str) -> bool:
        """Check if file already exists in Supabase storage."""
        try:
            # List files in the directory
            folder = '/'.join(path.split('/')[:-1])
            filename = path.split('/')[-1]
            
            result = self.supabase.storage.from_(BUCKET_NAME).list(folder)
            
            for item in result:
                if item.get('name') == filename:
                    return True
            return False
        except Exception:
            return False
    
    def upload_file(self, local_path: Path, storage_path: str) -> Optional[str]:
        """
        Upload a file to Supabase storage.
        Returns the public URL or None on error.
        """
        try:
            # Check if already exists
            if self.file_exists_in_storage(storage_path):
                self.stats["skipped"] += 1
                return self.get_public_url(storage_path)
            
            # Read file
            with open(local_path, 'rb') as f:
                file_data = f.read()
                
            content_type = self.get_content_type(local_path)
            
            # Upload
            self.supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=file_data,
                file_options={
                    "content-type": content_type,
                    "cache-control": "public, max-age=31536000"  # 1 year cache
                }
            )
            
            self.stats["uploaded"] += 1
            return self.get_public_url(storage_path)
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"    ❌ Upload error: {e}")
            return None
    
    def get_public_url(self, storage_path: str) -> str:
        """Get public URL for a storage path."""
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
    
    def extract_slug_from_filename(self, filename: str) -> str:
        """Extract instrument slug from filename."""
        return Path(filename).stem
    
    async def update_instrument_urls(
        self, 
        session: AsyncSession, 
        slug: str, 
        image_url: Optional[str], 
        thumbnail_url: Optional[str]
    ):
        """Update instrument with image URLs."""
        # Try to match by slugified name
        query = text("""
            UPDATE instruments 
            SET image_url = COALESCE(:image_url, image_url),
                thumbnail_url = COALESCE(:thumbnail_url, thumbnail_url),
                updated_at = NOW()
            WHERE LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-')) = :slug
            OR LOWER(REPLACE(REPLACE(name, ' ', ''), '_', '')) = :slug_no_hyphen
        """)
        
        result = await session.execute(query, {
            "image_url": image_url,
            "thumbnail_url": thumbnail_url,
            "slug": slug.lower(),
            "slug_no_hyphen": slug.lower().replace('-', '')
        })
        
        if result.rowcount > 0:
            self.stats["db_updated"] += 1
            return True
        return False
    
    def get_images_to_upload(self) -> list:
        """Get list of image files to upload."""
        images = []
        
        if PROCESSED_DIR.exists():
            for f in PROCESSED_DIR.iterdir():
                if f.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}:
                    slug = self.extract_slug_from_filename(f.name)
                    thumb_path = None
                    
                    # Find matching thumbnail
                    if THUMBNAILS_DIR.exists():
                        for ext in ['.png', '.jpg', '.jpeg', '.webp']:
                            potential_thumb = THUMBNAILS_DIR / f"{slug}{ext}"
                            if potential_thumb.exists():
                                thumb_path = potential_thumb
                                break
                    
                    images.append({
                        "slug": slug,
                        "primary_path": f,
                        "thumbnail_path": thumb_path
                    })
                    
        return images
    
    async def upload_all(self, filter_slug: Optional[str] = None, update_db: bool = True):
        """Upload all images to Supabase."""
        images = self.get_images_to_upload()
        
        if filter_slug:
            images = [img for img in images if filter_slug.lower() in img["slug"].lower()]
            
        print(f"\nUploading {len(images)} image sets...\n")
        
        async with self.async_session() as session:
            for i, img in enumerate(images):
                slug = img["slug"]
                print(f"[{i+1}/{len(images)}] {slug}")
                
                # Upload primary image
                primary_url = None
                if img["primary_path"]:
                    storage_path = f"primary/{img['primary_path'].name}"
                    primary_url = self.upload_file(img["primary_path"], storage_path)
                    if primary_url:
                        print(f"    ✓ Primary uploaded")
                        
                # Upload thumbnail
                thumb_url = None
                if img["thumbnail_path"]:
                    storage_path = f"thumbnails/{img['thumbnail_path'].name}"
                    thumb_url = self.upload_file(img["thumbnail_path"], storage_path)
                    if thumb_url:
                        print(f"    ✓ Thumbnail uploaded")
                        
                # Update database
                if update_db and (primary_url or thumb_url):
                    updated = await self.update_instrument_urls(
                        session, slug, primary_url, thumb_url
                    )
                    if updated:
                        print(f"    ✓ Database updated")
                    else:
                        print(f"    ⚠️  No matching instrument found for '{slug}'")
                        
            await session.commit()
            
        self.print_stats()
        
    def print_stats(self):
        """Print upload statistics."""
        print("\n" + "="*50)
        print("IMAGE UPLOAD STATISTICS")
        print("="*50)
        print(f"  Uploaded:   {self.stats['uploaded']}")
        print(f"  Skipped:    {self.stats['skipped']} (already exist)")
        print(f"  DB Updated: {self.stats['db_updated']}")
        print(f"  Errors:     {self.stats['errors']}")
        print("="*50)


async def main():
    if not SUPABASE_AVAILABLE:
        print("❌ Supabase client required. Install with: pip install supabase")
        return
        
    parser = argparse.ArgumentParser(description="Upload images to Supabase Storage")
    parser.add_argument("--instrument", type=str, help="Upload specific instrument by slug")
    parser.add_argument("--update-db", action="store_true", help="Only update DB URLs (no upload)")
    parser.add_argument("--no-db", action="store_true", help="Upload only, don't update DB")
    
    args = parser.parse_args()
    
    uploader = ImageUploader()
    
    try:
        uploader.connect_supabase()
        await uploader.connect_db()
        
        await uploader.upload_all(
            filter_slug=args.instrument,
            update_db=not args.no_db
        )
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
    finally:
        await uploader.disconnect_db()


if __name__ == "__main__":
    asyncio.run(main())
