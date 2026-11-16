import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const categoriesToUpsert = [
  {
    name: '1/8 of a Beef',
    slug: 'eighth-of-a-beef',
    description: 'An eighth share of a whole pasture-raised beef — ideal starter pack with a curated selection of premium steaks, roasts, and ground beef.',
    sort_order: 19,
    is_active: true
  },
  {
    name: '1/4 of a Beef',
    slug: 'quarter-of-a-beef',
    description: 'A quarter share of a whole pasture-raised beef — a generous assortment of steaks, roasts, ribs, ground beef, and specialty cuts for the dedicated home cook.',
    sort_order: 20,
    is_active: true
  },
  {
    name: '1/2 of a Beef',
    slug: 'half-of-a-beef',
    description: 'A half share of a whole pasture-raised beef — a substantial selection covering all primal cuts, perfect for families and serious beef enthusiasts.',
    sort_order: 21,
    is_active: true
  },
  {
    name: 'A Full Beef',
    slug: 'full-beef',
    description: 'A whole pasture-raised beef — the complete animal custom-butchered to your specifications. Maximum value, full freezer, total control over your cuts.',
    sort_order: 22,
    is_active: true
  }
];

async function syncCategories() {
  console.log('🔄 Checking existing categories in Supabase Cloud...');
  const { data: existingCats, error: fetchErr } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (fetchErr) {
    console.error('❌ Error fetching categories:', fetchErr);
    process.exit(1);
  }

  console.log(`Current Supabase categories: ${existingCats.length}`);

  for (const cat of categoriesToUpsert) {
    const existing = existingCats.find(c => c.slug === cat.slug);
    if (existing) {
      console.log(`  Updating "${cat.name}" (id: ${existing.id})...`);
      const { error: updateErr } = await client
        .from('categories')
        .update({
          name: cat.name,
          description: cat.description,
          sort_order: cat.sort_order,
          is_active: true
        })
        .eq('id', existing.id);
      if (updateErr) console.error(`  ❌ Update failed for ${cat.name}:`, updateErr.message);
      else console.log(`  ✅ Updated "${cat.name}" in Supabase.`);
    } else {
      console.log(`  Inserting "${cat.name}"...`);
      const { data: newCat, error: insertErr } = await client
        .from('categories')
        .insert([cat])
        .select();
      if (insertErr) console.error(`  ❌ Insert failed for ${cat.name}:`, insertErr.message);
      else console.log(`  ✅ Inserted "${cat.name}" in Supabase:`, newCat[0]?.id);
    }
  }

  // Fetch final list to verify
  const { data: finalCats, error: finalErr } = await client
    .from('categories')
    .select('id, name, slug, sort_order, is_active')
    .order('sort_order', { ascending: true });

  if (finalErr) {
    console.error('❌ Error verifying final list:', finalErr);
  } else {
    console.log(`\n🎉 Total categories in Supabase Cloud: ${finalCats.length}`);
    finalCats.forEach(c => console.log(`  - [${c.sort_order}] ${c.name} (${c.slug})`));

    // Update local_db.json with matching IDs and records from Supabase
    const localDbPath = path.join(__dirname, '../database/local_db.json');
    if (fs.existsSync(localDbPath)) {
      const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      localDb.categories = finalCats;
      fs.writeFileSync(localDbPath, JSON.stringify(localDb, null, 2), 'utf8');
      console.log('✅ local_db.json successfully updated with live Supabase categories.');
    }
  }
}

syncCategories().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
