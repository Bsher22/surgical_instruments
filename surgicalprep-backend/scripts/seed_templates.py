"""
Template Preference Cards Seeding Script
Stage 9: Content Population

Usage:
    python -m scripts.seed_templates              # Seed all templates
    python -m scripts.seed_templates --rollback   # Remove template cards
    python -m scripts.seed_templates --template=x # Seed specific template
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

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DATA_DIR = Path(__file__).parent / "data"


class TemplateSeeder:
    """Handles template preference card seeding."""
    
    def __init__(self):
        self.engine = None
        self.async_session = None
        self.instrument_cache = {}  # name -> id mapping
        self.stats = {
            "cards_created": 0,
            "items_created": 0,
            "errors": 0
        }
        
    async def connect(self):
        """Establish database connection."""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable not set")
            
        self.engine = create_async_engine(DATABASE_URL, echo=False)
        self.async_session = sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
        print("✓ Connected to database")
        
    async def disconnect(self):
        """Close database connection."""
        if self.engine:
            await self.engine.dispose()
            
    async def load_instrument_cache(self, session: AsyncSession):
        """Load instrument name -> id mapping."""
        result = await session.execute(
            text("SELECT id, LOWER(name) as name FROM instruments")
        )
        rows = result.fetchall()
        self.instrument_cache = {row.name: str(row.id) for row in rows}
        print(f"✓ Loaded {len(self.instrument_cache)} instruments into cache")
        
    def load_templates_data(self, file_path: Optional[Path] = None) -> list:
        """Load template data from JSON file."""
        if file_path is None:
            file_path = DATA_DIR / "templates.json"
            
        if not file_path.exists():
            raise FileNotFoundError(f"Templates data file not found: {file_path}")
            
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        templates = data.get("templates", [])
        print(f"✓ Loaded {len(templates)} templates from {file_path.name}")
        return templates
    
    def resolve_instrument_id(self, name: str) -> Optional[str]:
        """Look up instrument ID by name."""
        return self.instrument_cache.get(name.lower())
    
    async def create_preference_card(self, session: AsyncSession, template: dict) -> str:
        """Create a preference card. Returns card ID."""
        card_id = str(uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": card_id,
            "user_id": None,  # System template, no user
            "title": template["title"],
            "surgeon_name": template.get("surgeon_name", "Template"),
            "procedure_name": template["procedure_name"],
            "specialty": template["specialty"],
            "general_notes": template.get("general_notes"),
            "setup_notes": template.get("setup_notes"),
            "is_template": True,
            "is_public": True,
            "created_at": now,
            "updated_at": now
        }
        
        query = text("""
            INSERT INTO preference_cards (
                id, user_id, title, surgeon_name, procedure_name,
                specialty, general_notes, setup_notes,
                is_template, is_public, created_at, updated_at
            ) VALUES (
                :id, :user_id, :title, :surgeon_name, :procedure_name,
                :specialty, :general_notes, :setup_notes,
                :is_template, :is_public, :created_at, :updated_at
            )
        """)
        
        await session.execute(query, data)
        return card_id
    
    async def create_card_item(
        self, 
        session: AsyncSession, 
        card_id: str, 
        item: dict, 
        position: int
    ):
        """Create a card item."""
        item_id = str(uuid4())
        
        # Resolve instrument ID if provided by name
        instrument_id = item.get("instrument_id")
        if not instrument_id and item.get("instrument_name"):
            instrument_id = self.resolve_instrument_id(item["instrument_name"])
            if not instrument_id:
                print(f"    ⚠️  Instrument not found: {item['instrument_name']}")
        
        data = {
            "id": item_id,
            "card_id": card_id,
            "instrument_id": instrument_id,
            "custom_name": item.get("custom_name"),
            "quantity": item.get("quantity", 1),
            "size": item.get("size"),
            "notes": item.get("notes"),
            "category": item.get("category", "instruments"),
            "position": position
        }
        
        query = text("""
            INSERT INTO card_items (
                id, card_id, instrument_id, custom_name,
                quantity, size, notes, category, position
            ) VALUES (
                :id, :card_id, :instrument_id, :custom_name,
                :quantity, :size, :notes, :category, :position
            )
        """)
        
        await session.execute(query, data)
        
    async def seed_template(self, session: AsyncSession, template: dict):
        """Seed a single template with all its items."""
        print(f"  Creating: {template['title']}")
        
        try:
            # Create the card
            card_id = await self.create_preference_card(session, template)
            self.stats["cards_created"] += 1
            
            # Create items
            items = template.get("items", [])
            for i, item in enumerate(items):
                await self.create_card_item(session, card_id, item, i)
                self.stats["items_created"] += 1
                
            print(f"    ✓ Created with {len(items)} items")
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"    ❌ Error: {e}")
            raise
            
    async def seed_all_templates(self, templates: list, filter_name: Optional[str] = None):
        """Seed all templates to database."""
        async with self.async_session() as session:
            # Load instrument cache first
            await self.load_instrument_cache(session)
            
            print(f"\nSeeding {len(templates)} templates...")
            
            for template in templates:
                # Filter if specific template requested
                if filter_name and filter_name.lower() not in template["title"].lower():
                    continue
                    
                await self.seed_template(session, template)
                
            await session.commit()
            print("\n✓ All templates committed to database")
            
    async def rollback_templates(self):
        """Remove all template preference cards."""
        async with self.async_session() as session:
            # First delete items for template cards
            result1 = await session.execute(text("""
                DELETE FROM card_items 
                WHERE card_id IN (
                    SELECT id FROM preference_cards WHERE is_template = true
                )
            """))
            
            # Then delete the cards
            result2 = await session.execute(text("""
                DELETE FROM preference_cards WHERE is_template = true
            """))
            
            await session.commit()
            print(f"✓ Removed {result2.rowcount} template cards and their items")
            
    def print_stats(self):
        """Print seeding statistics."""
        print("\n" + "="*50)
        print("TEMPLATE SEEDING STATISTICS")
        print("="*50)
        print(f"  Cards Created: {self.stats['cards_created']}")
        print(f"  Items Created: {self.stats['items_created']}")
        print(f"  Errors:        {self.stats['errors']}")
        print("="*50)


async def main():
    parser = argparse.ArgumentParser(description="Seed template preference cards")
    parser.add_argument("--rollback", action="store_true", help="Remove template cards")
    parser.add_argument("--template", type=str, help="Seed specific template by name")
    parser.add_argument("--file", type=str, help="Custom templates file path")
    
    args = parser.parse_args()
    
    seeder = TemplateSeeder()
    
    try:
        await seeder.connect()
        
        if args.rollback:
            print("\n⚠️  ROLLBACK MODE - This will delete all template cards!")
            confirm = input("Type 'yes' to confirm: ")
            if confirm.lower() == "yes":
                await seeder.rollback_templates()
            else:
                print("Rollback cancelled")
            return
            
        # Load and seed templates
        file_path = Path(args.file) if args.file else None
        templates = seeder.load_templates_data(file_path)
        
        await seeder.seed_all_templates(templates, filter_name=args.template)
        seeder.print_stats()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
    finally:
        await seeder.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
