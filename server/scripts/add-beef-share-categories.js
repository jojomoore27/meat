/**
 * One-time migration: Add Beef Share categories (1/8, 1/4, 1/2, Full Beef)
 * 
 * Run manually:   node scripts/add-beef-share-categories.js
 * 
 * Safe to run multiple times — only inserts categories that don't already exist.
 */
import 'dotenv/config';
import { connectDb, query, queryOne } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const BEEF_SHARE_CATEGORIES = [
  {
    name: '1/8 of a Beef',
    slug: 'eighth-of-a-beef',
    description: 'An eighth share of a whole pasture-raised beef — ideal starter pack with a curated selection of premium steaks, roasts, and ground beef.',
    sort_order: 19
  },
  {
    name: '1/4 of a Beef',
    slug: 'quarter-of-a-beef',
    description: 'A quarter share of a whole pasture-raised beef — a generous assortment of steaks, roasts, ribs, ground beef, and specialty cuts for the dedicated home cook.',
    sort_order: 20
  },
  {
    name: '1/2 of a Beef',
    slug: 'half-of-a-beef',
    description: 'A half share of a whole pasture-raised beef — a substantial selection covering all primal cuts, perfect for families and serious beef enthusiasts.',
    sort_order: 21
  },
  {
    name: 'A Full Beef',
    slug: 'full-beef',
    description: 'A whole pasture-raised beef — the complete animal custom-butchered to your specifications. Maximum value, full freezer, total control over your cuts.',
    sort_order: 22
  }
];

async function migrate() {
  console.log('🔌 Connecting to database...');
  await connectDb();

  console.log('🥩 Adding Beef Share categories...\n');

  let added = 0;
  let skipped = 0;

  for (const cat of BEEF_SHARE_CATEGORIES) {
    const existing = await queryOne('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
    if (existing) {
      console.log(`  ⏭️  "${cat.name}" already exists — skipped.`);
      skipped++;
      continue;
    }

    const id = uuidv4();
    await query(
      'INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, 1)',
      [id, cat.name, cat.slug, cat.description, cat.sort_order]
    );
    console.log(`  ✅  "${cat.name}" — added (id: ${id})`);
    added++;
  }

  console.log(`\n📊 Done: ${added} added, ${skipped} already existed.`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
