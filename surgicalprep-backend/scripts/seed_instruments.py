"""
Instrument Database Seeding Script
Stage 9: Content Population

Usage:
    python -m scripts.seed_instruments --full          # Full seed with images
    python -m scripts.seed_instruments --data-only     # Data only, no images
    python -m scripts.seed_instruments --dry-run       # Validate without inserting
    python -m scripts.seed_instruments --rollback      # Remove seeded data
    python -m scripts.seed_instruments --add --file=x  # Add new instruments
"""

import asyncio
import json
import argparse
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
DATA_DIR = Path(__file__).parent / "data"
BATCH_SIZE = 50


class InstrumentSeeder:
    """Handles instrument database seeding operations."""
    
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.engine = None
        self.async_session = None
        self.stats = {
            "inserted": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0
        }
        
    async def connect(self):
        """Establish database connection."""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable not set")
            
        self.engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            pool_size=5,
            max_overflow=10
        )
        self.async_session = sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
        print(f"✓ Connected to database")
        
    async def disconnect(self):
        """Close database connection."""
        if self.engine:
            await self.engine.dispose()
            print("✓ Database connection closed")
            
    def load_instruments_data(self, file_path: Optional[Path] = None) -> list:
        """Load instrument data from JSON file."""
        if file_path is None:
            file_path = DATA_DIR / "instruments.json"
            
        if not file_path.exists():
            raise FileNotFoundError(f"Instruments data file not found: {file_path}")
            
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        instruments = data.get("instruments", [])
        print(f"✓ Loaded {len(instruments)} instruments from {file_path.name}")
        return instruments
    
    def validate_instrument(self, instrument: dict, index: int) -> list:
        """Validate a single instrument record. Returns list of errors."""
        errors = []
        required_fields = ["name", "category", "description", "primary_uses"]
        
        for field in required_fields:
            if not instrument.get(field):
                errors.append(f"Row {index}: Missing required field '{field}'")
                
        if instrument.get("primary_uses") and len(instrument["primary_uses"]) < 1:
            errors.append(f"Row {index}: 'primary_uses' must have at least 1 item")
            
        if instrument.get("description") and len(instrument["description"]) < 20:
            errors.append(f"Row {index}: 'description' too short (min 20 chars)")
            
        return errors
    
    def validate_all(self, instruments: list) -> tuple[bool, list]:
        """Validate all instruments. Returns (is_valid, errors)."""
        all_errors = []
        names_seen = set()
        
        for i, instrument in enumerate(instruments):
            # Check for duplicates
            name = instrument.get("name", "").lower()
            if name in names_seen:
                all_errors.append(f"Row {i}: Duplicate instrument name '{instrument.get('name')}'")
            names_seen.add(name)
            
            # Validate fields
            errors = self.validate_instrument(instrument, i)
            all_errors.extend(errors)
            
        is_valid = len(all_errors) == 0
        return is_valid, all_errors
    
    async def check_existing(self, session: AsyncSession, name: str) -> Optional[str]:
        """Check if instrument already exists. Returns ID if found."""
        result = await session.execute(
            text("SELECT id FROM instruments WHERE LOWER(name) = LOWER(:name)"),
            {"name": name}
        )
        row = result.fetchone()
        return str(row[0]) if row else None
    
    def generate_search_vector(self, instrument: dict) -> str:
        """Generate search text for full-text search."""
        parts = [
            instrument.get("name", ""),
            " ".join(instrument.get("aliases", [])),
            instrument.get("category", ""),
            instrument.get("description", ""),
            " ".join(instrument.get("primary_uses", [])),
            " ".join(instrument.get("common_procedures", []))
        ]
        return " ".join(filter(None, parts))
    
    async def insert_instrument(self, session: AsyncSession, instrument: dict) -> str:
        """Insert a single instrument. Returns the ID."""
        instrument_id = str(uuid4())
        now = datetime.utcnow().isoformat()
        
        # Prepare data
        data = {
            "id": instrument_id,
            "name": instrument["name"],
            "aliases": instrument.get("aliases", []),
            "category": instrument["category"],
            "description": instrument["description"],
            "primary_uses": instrument.get("primary_uses", []),
            "common_procedures": instrument.get("common_procedures", []),
            "handling_notes": instrument.get("handling_notes"),
            "image_url": instrument.get("image_url"),
            "thumbnail_url": instrument.get("thumbnail_url"),
            "is_premium": instrument.get("is_premium", False),
            "created_at": now,
            "updated_at": now,
            "search_vector": self.generate_search_vector(instrument)
        }
        
        # Insert query
        query = text("""
            INSERT INTO instruments (
                id, name, aliases, category, description, 
                primary_uses, common_procedures, handling_notes,
                image_url, thumbnail_url, is_premium,
                created_at, updated_at, search_vector
            ) VALUES (
                :id, :name, :aliases, :category, :description,
                :primary_uses, :common_procedures, :handling_notes,
                :image_url, :thumbnail_url, :is_premium,
                :created_at, :updated_at, to_tsvector('english', :search_vector)
            )
        """)
        
        await session.execute(query, data)
        return instrument_id
    
    async def update_instrument(self, session: AsyncSession, instrument_id: str, instrument: dict):
        """Update an existing instrument."""
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": instrument_id,
            "name": instrument["name"],
            "aliases": instrument.get("aliases", []),
            "category": instrument["category"],
            "description": instrument["description"],
            "primary_uses": instrument.get("primary_uses", []),
            "common_procedures": instrument.get("common_procedures", []),
            "handling_notes": instrument.get("handling_notes"),
            "is_premium": instrument.get("is_premium", False),
            "updated_at": now,
            "search_vector": self.generate_search_vector(instrument)
        }
        
        query = text("""
            UPDATE instruments SET
                name = :name,
                aliases = :aliases,
                category = :category,
                description = :description,
                primary_uses = :primary_uses,
                common_procedures = :common_procedures,
                handling_notes = :handling_notes,
                is_premium = :is_premium,
                updated_at = :updated_at,
                search_vector = to_tsvector('english', :search_vector)
            WHERE id = :id
        """)
        
        await session.execute(query, data)
    
    async def seed_instruments(self, instruments: list, update_existing: bool = False):
        """Seed all instruments to database."""
        print(f"\n{'[DRY RUN] ' if self.dry_run else ''}Seeding {len(instruments)} instruments...")
        
        async with self.async_session() as session:
            for i, instrument in enumerate(instruments):
                try:
                    # Check if exists
                    existing_id = await self.check_existing(session, instrument["name"])
                    
                    if existing_id:
                        if update_existing:
                            if not self.dry_run:
                                await self.update_instrument(session, existing_id, instrument)
                            self.stats["updated"] += 1
                            print(f"  Updated: {instrument['name']}")
                        else:
                            self.stats["skipped"] += 1
                            if i < 10:  # Only show first 10 skips
                                print(f"  Skipped (exists): {instrument['name']}")
                    else:
                        if not self.dry_run:
                            await self.insert_instrument(session, instrument)
                        self.stats["inserted"] += 1
                        
                    # Progress indicator
                    if (i + 1) % 50 == 0:
                        print(f"  Progress: {i + 1}/{len(instruments)}")
                        
                except Exception as e:
                    self.stats["errors"] += 1
                    print(f"  ERROR on '{instrument.get('name', 'unknown')}': {e}")
                    
            if not self.dry_run:
                await session.commit()
                print("✓ Changes committed to database")
            else:
                print("✓ Dry run complete (no changes made)")
                
    async def rollback_seeded(self, batch_date: Optional[str] = None):
        """Remove all seeded instruments."""
        if self.dry_run:
            print("[DRY RUN] Would remove all seeded instruments")
            return
            
        async with self.async_session() as session:
            if batch_date:
                query = text("DELETE FROM instruments WHERE DATE(created_at) = :date")
                result = await session.execute(query, {"date": batch_date})
            else:
                # Remove all instruments that aren't user-created
                # In a real scenario, you'd have a flag or batch_id
                query = text("DELETE FROM instruments")
                result = await session.execute(query)
                
            await session.commit()
            print(f"✓ Removed {result.rowcount} instruments")
            
    def print_stats(self):
        """Print seeding statistics."""
        print("\n" + "="*50)
        print("SEEDING STATISTICS")
        print("="*50)
        print(f"  Inserted: {self.stats['inserted']}")
        print(f"  Updated:  {self.stats['updated']}")
        print(f"  Skipped:  {self.stats['skipped']}")
        print(f"  Errors:   {self.stats['errors']}")
        print("="*50)


async def main():
    parser = argparse.ArgumentParser(description="Seed instruments to database")
    parser.add_argument("--full", action="store_true", help="Full seed with images")
    parser.add_argument("--data-only", action="store_true", help="Seed data only, no images")
    parser.add_argument("--dry-run", action="store_true", help="Validate without inserting")
    parser.add_argument("--rollback", action="store_true", help="Remove seeded data")
    parser.add_argument("--add", action="store_true", help="Add new instruments")
    parser.add_argument("--update", action="store_true", help="Update existing instruments")
    parser.add_argument("--file", type=str, help="Custom data file path")
    parser.add_argument("--batch", type=str, help="Batch date for rollback (YYYY-MM-DD)")
    
    args = parser.parse_args()
    
    seeder = InstrumentSeeder(dry_run=args.dry_run)
    
    try:
        await seeder.connect()
        
        if args.rollback:
            print("\n⚠️  ROLLBACK MODE - This will delete instruments!")
            confirm = input("Type 'yes' to confirm: ")
            if confirm.lower() == "yes":
                await seeder.rollback_seeded(args.batch)
            else:
                print("Rollback cancelled")
            return
            
        # Load data
        file_path = Path(args.file) if args.file else None
        instruments = seeder.load_instruments_data(file_path)
        
        # Validate
        print("\nValidating data...")
        is_valid, errors = seeder.validate_all(instruments)
        
        if not is_valid:
            print(f"\n❌ Validation failed with {len(errors)} errors:")
            for error in errors[:20]:  # Show first 20 errors
                print(f"  - {error}")
            if len(errors) > 20:
                print(f"  ... and {len(errors) - 20} more errors")
            sys.exit(1)
        else:
            print(f"✓ All {len(instruments)} instruments validated")
            
        # Seed
        update_existing = args.update or args.add
        await seeder.seed_instruments(instruments, update_existing=update_existing)
        
        # Handle images if full seed
        if args.full and not args.dry_run:
            print("\nProcessing and uploading images...")
            # Import and run image upload
            from .upload_images import ImageUploader
            uploader = ImageUploader()
            await uploader.upload_all()
            
        seeder.print_stats()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
    finally:
        await seeder.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
