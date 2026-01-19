"""
Seed Verification Script
Stage 9: Content Population

Verifies that all content was seeded correctly.

Usage:
    python -m scripts.verify_seed                    # Run all checks
    python -m scripts.verify_seed --check=instruments
    python -m scripts.verify_seed --check=images
    python -m scripts.verify_seed --check=templates
    python -m scripts.verify_seed --check=search
"""

import asyncio
import argparse
import os
from typing import List, Tuple

import aiohttp
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


class SeedVerifier:
    """Verifies seeded content integrity."""
    
    def __init__(self):
        self.engine = None
        self.async_session = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }
        
    async def connect(self):
        """Establish database connection."""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL must be set")
            
        self.engine = create_async_engine(DATABASE_URL, echo=False)
        self.async_session = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        print("✓ Connected to database\n")
        
    async def disconnect(self):
        """Close database connection."""
        if self.engine:
            await self.engine.dispose()
            
    def pass_check(self, message: str):
        """Record a passed check."""
        self.results["passed"] += 1
        print(f"  ✓ PASS: {message}")
        
    def fail_check(self, message: str):
        """Record a failed check."""
        self.results["failed"] += 1
        print(f"  ✗ FAIL: {message}")
        
    def warn_check(self, message: str):
        """Record a warning."""
        self.results["warnings"] += 1
        print(f"  ⚠ WARN: {message}")
        
    async def verify_instruments(self, session: AsyncSession):
        """Verify instrument data integrity."""
        print("=" * 50)
        print("INSTRUMENTS VERIFICATION")
        print("=" * 50)
        
        # Check total count
        result = await session.execute(text("SELECT COUNT(*) FROM instruments"))
        count = result.scalar()
        
        if count >= 200:
            self.pass_check(f"Instrument count: {count} (target: 200+)")
        elif count >= 100:
            self.warn_check(f"Instrument count: {count} (target: 200+)")
        else:
            self.fail_check(f"Instrument count: {count} (target: 200+)")
            
        # Check for required fields
        result = await session.execute(text("""
            SELECT COUNT(*) FROM instruments 
            WHERE name IS NULL OR name = ''
               OR category IS NULL OR category = ''
               OR description IS NULL OR description = ''
        """))
        missing = result.scalar()
        
        if missing == 0:
            self.pass_check("All required fields populated")
        else:
            self.fail_check(f"{missing} instruments with missing required fields")
            
        # Check for duplicates
        result = await session.execute(text("""
            SELECT LOWER(name), COUNT(*) 
            FROM instruments 
            GROUP BY LOWER(name) 
            HAVING COUNT(*) > 1
        """))
        duplicates = result.fetchall()
        
        if len(duplicates) == 0:
            self.pass_check("No duplicate instrument names")
        else:
            self.fail_check(f"{len(duplicates)} duplicate instrument names found")
            for name, cnt in duplicates[:5]:
                print(f"      - '{name}' appears {cnt} times")
                
        # Check categories distribution
        result = await session.execute(text("""
            SELECT category, COUNT(*) as cnt 
            FROM instruments 
            GROUP BY category 
            ORDER BY cnt DESC
        """))
        categories = result.fetchall()
        
        print(f"\n  Category distribution:")
        for cat, cnt in categories:
            print(f"    - {cat}: {cnt}")
            
        if len(categories) >= 5:
            self.pass_check(f"Good category variety: {len(categories)} categories")
        else:
            self.warn_check(f"Limited categories: {len(categories)} (target: 5+)")
            
        # Check primary_uses populated
        result = await session.execute(text("""
            SELECT COUNT(*) FROM instruments 
            WHERE primary_uses IS NULL 
               OR array_length(primary_uses, 1) IS NULL
               OR array_length(primary_uses, 1) = 0
        """))
        no_uses = result.scalar()
        
        if no_uses == 0:
            self.pass_check("All instruments have primary_uses")
        else:
            self.warn_check(f"{no_uses} instruments missing primary_uses")
            
        print()
        
    async def verify_images(self, session: AsyncSession):
        """Verify image URLs are accessible."""
        print("=" * 50)
        print("IMAGES VERIFICATION")
        print("=" * 50)
        
        # Check how many have image URLs
        result = await session.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(image_url) as with_image,
                COUNT(thumbnail_url) as with_thumb
            FROM instruments
        """))
        row = result.fetchone()
        total, with_image, with_thumb = row
        
        image_pct = (with_image / total * 100) if total > 0 else 0
        thumb_pct = (with_thumb / total * 100) if total > 0 else 0
        
        if image_pct >= 80:
            self.pass_check(f"Image URLs: {with_image}/{total} ({image_pct:.1f}%)")
        elif image_pct >= 50:
            self.warn_check(f"Image URLs: {with_image}/{total} ({image_pct:.1f}%)")
        else:
            self.fail_check(f"Image URLs: {with_image}/{total} ({image_pct:.1f}%)")
            
        if thumb_pct >= 80:
            self.pass_check(f"Thumbnail URLs: {with_thumb}/{total} ({thumb_pct:.1f}%)")
        elif thumb_pct >= 50:
            self.warn_check(f"Thumbnail URLs: {with_thumb}/{total} ({thumb_pct:.1f}%)")
        else:
            self.fail_check(f"Thumbnail URLs: {with_thumb}/{total} ({thumb_pct:.1f}%)")
            
        # Spot check some image URLs
        result = await session.execute(text("""
            SELECT name, image_url FROM instruments 
            WHERE image_url IS NOT NULL 
            LIMIT 5
        """))
        sample_urls = result.fetchall()
        
        if sample_urls:
            print(f"\n  Checking {len(sample_urls)} sample image URLs...")
            async with aiohttp.ClientSession() as http:
                for name, url in sample_urls:
                    try:
                        async with http.head(url, timeout=5) as resp:
                            if resp.status == 200:
                                self.pass_check(f"URL accessible: {name}")
                            else:
                                self.fail_check(f"URL returned {resp.status}: {name}")
                    except Exception as e:
                        self.fail_check(f"URL error for {name}: {e}")
        else:
            self.warn_check("No image URLs to verify")
            
        print()
        
    async def verify_templates(self, session: AsyncSession):
        """Verify template preference cards."""
        print("=" * 50)
        print("TEMPLATES VERIFICATION")
        print("=" * 50)
        
        # Check template count
        result = await session.execute(text("""
            SELECT COUNT(*) FROM preference_cards WHERE is_template = true
        """))
        count = result.scalar()
        
        if count >= 10:
            self.pass_check(f"Template count: {count} (target: 10+)")
        elif count >= 5:
            self.warn_check(f"Template count: {count} (target: 10+)")
        else:
            self.fail_check(f"Template count: {count} (target: 10+)")
            
        # Check templates have items
        result = await session.execute(text("""
            SELECT pc.title, COUNT(ci.id) as item_count
            FROM preference_cards pc
            LEFT JOIN card_items ci ON ci.card_id = pc.id
            WHERE pc.is_template = true
            GROUP BY pc.id, pc.title
            ORDER BY item_count DESC
        """))
        templates = result.fetchall()
        
        print(f"\n  Template item counts:")
        empty_templates = 0
        for title, item_count in templates:
            status = "✓" if item_count > 0 else "✗"
            print(f"    {status} {title}: {item_count} items")
            if item_count == 0:
                empty_templates += 1
                
        if empty_templates == 0:
            self.pass_check("All templates have items")
        else:
            self.fail_check(f"{empty_templates} templates have no items")
            
        # Check items reference valid instruments
        result = await session.execute(text("""
            SELECT COUNT(*) FROM card_items ci
            JOIN preference_cards pc ON pc.id = ci.card_id
            WHERE pc.is_template = true
              AND ci.instrument_id IS NOT NULL
              AND ci.instrument_id NOT IN (SELECT id FROM instruments)
        """))
        invalid_refs = result.scalar()
        
        if invalid_refs == 0:
            self.pass_check("All item instrument references are valid")
        else:
            self.fail_check(f"{invalid_refs} items reference non-existent instruments")
            
        print()
        
    async def verify_search(self, session: AsyncSession):
        """Verify full-text search functionality."""
        print("=" * 50)
        print("SEARCH VERIFICATION")
        print("=" * 50)
        
        # Check search vectors exist
        result = await session.execute(text("""
            SELECT COUNT(*) FROM instruments WHERE search_vector IS NOT NULL
        """))
        with_vector = result.scalar()
        
        result = await session.execute(text("SELECT COUNT(*) FROM instruments"))
        total = result.scalar()
        
        pct = (with_vector / total * 100) if total > 0 else 0
        
        if pct >= 90:
            self.pass_check(f"Search vectors: {with_vector}/{total} ({pct:.1f}%)")
        else:
            self.fail_check(f"Search vectors: {with_vector}/{total} ({pct:.1f}%)")
            
        # Test some searches
        test_queries = ["scissors", "forceps", "retractor", "clamp", "needle"]
        
        print(f"\n  Testing search queries:")
        for query in test_queries:
            result = await session.execute(text("""
                SELECT COUNT(*) FROM instruments 
                WHERE search_vector @@ plainto_tsquery('english', :query)
            """), {"query": query})
            count = result.scalar()
            
            if count > 0:
                self.pass_check(f"Search '{query}': {count} results")
            else:
                self.warn_check(f"Search '{query}': 0 results")
                
        print()
        
    async def run_all_checks(self, checks: List[str] = None):
        """Run all verification checks."""
        available_checks = ["instruments", "images", "templates", "search"]
        
        if checks is None:
            checks = available_checks
            
        async with self.async_session() as session:
            if "instruments" in checks:
                await self.verify_instruments(session)
                
            if "images" in checks:
                await self.verify_images(session)
                
            if "templates" in checks:
                await self.verify_templates(session)
                
            if "search" in checks:
                await self.verify_search(session)
                
        self.print_summary()
        
    def print_summary(self):
        """Print verification summary."""
        print("=" * 50)
        print("VERIFICATION SUMMARY")
        print("=" * 50)
        
        total = self.results["passed"] + self.results["failed"] + self.results["warnings"]
        
        print(f"  Total Checks: {total}")
        print(f"  ✓ Passed:     {self.results['passed']}")
        print(f"  ✗ Failed:     {self.results['failed']}")
        print(f"  ⚠ Warnings:   {self.results['warnings']}")
        print()
        
        if self.results["failed"] == 0:
            print("  🎉 ALL CHECKS PASSED!")
        else:
            print(f"  ❌ {self.results['failed']} CHECK(S) FAILED")
            
        print("=" * 50)


async def main():
    parser = argparse.ArgumentParser(description="Verify seeded content")
    parser.add_argument(
        "--check", 
        type=str, 
        choices=["instruments", "images", "templates", "search"],
        help="Run specific check only"
    )
    
    args = parser.parse_args()
    
    verifier = SeedVerifier()
    
    try:
        await verifier.connect()
        
        checks = [args.check] if args.check else None
        await verifier.run_all_checks(checks)
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
    finally:
        await verifier.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
