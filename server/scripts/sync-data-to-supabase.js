import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const localDbPath = path.join(__dirname, '../database/local_db.json');

async function syncToSupabase() {
  console.log('\n======================================================');
  console.log('       SYNC LOCAL DATA TO SUPABASE DATABASE           ');
  console.log('======================================================\n');

  if (!supabaseUrl || (!serviceKey && !anonKey)) {
    console.error('❌ Supabase credentials missing from .env');
    return;
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey);

  if (!fs.existsSync(localDbPath)) {
    console.error('❌ local_db.json not found.');
    return;
  }

  const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  const tables = ['admins', 'categories', 'products', 'faqs', 'testimonials', 'gallery_images', 'site_settings', 'cms_content', 'media_library'];

  let hadRlsError = false;

  for (const table of tables) {
    const rows = localDb[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    console.log(`⏳ Synchronizing ${rows.length} record(s) for table: ${table}...`);
    
    for (const row of rows) {
      // Upsert into Supabase
      const { data, error } = await client.from(table).upsert([row], { onConflict: 'id' }).select();
      if (error) {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          hadRlsError = true;
          console.warn(`  ⚠️ Table "${table}" blocked by Supabase RLS policy: ${error.message}`);
          break;
        } else {
          console.warn(`  ⚠️ Error syncing record in "${table}":`, error.message);
        }
      }
    }
  }

  if (hadRlsError) {
    console.log('\n👉 IMPORTANT SUPABASE ACTION REQUIRED (10 Seconds):');
    console.log('Row-Level Security (RLS) in Supabase is currently blocking direct writes from the anon key.');
    console.log('To grant immediate backend access:');
    console.log('1. Open your Supabase Dashboard > SQL Editor');
    console.log('2. Copy & paste the contents of: server/database/supabase_rls_setup.sql');
    console.log('3. Click "Run".');
    console.log('OR set SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL in your server/.env.\n');
  } else {
    console.log('\n🎉 Successfully synchronized data to Supabase database!\n');
  }
}

syncToSupabase().catch(console.error);
