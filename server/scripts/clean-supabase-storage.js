import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

const activeKey = serviceKey || anonKey;

console.log('='.repeat(70));
console.log('🧹 BestGrassFedCattle - Supabase Storage Cleanup Utility');
console.log('='.repeat(70));

if (!supabaseUrl || !activeKey) {
  console.error('❌ Supabase credentials not found in server/.env');
  process.exit(1);
}

console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Key Type: ${serviceKey ? 'Service Role Key (Full Admin Rights)' : 'Anon Key (Subject to RLS Policies)'}`);

const client = createClient(supabaseUrl, activeKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Target list of deleted / test pictures from screenshot
const targetFiles = [
  'farm_1791324143604_521.jpg',
  'farm_1791324374802_583.jpg',
  'farm_1791324374802_583.jpeg',
  'farm_1791326268585_306.jpg',
  'farm_1791326268585_306.jpeg',
  'farm_1791332991455_466.jpeg',
  'farm_1791332991455_466.jpg',
  'test.txt',
  'test_ping_1791669414925.gif',
  'probe_1791758250718.txt'
];

async function runCleanup() {
  console.log(`\nTargeting ${targetFiles.length} candidate files for permanent removal...\n`);

  for (const fileName of targetFiles) {
    try {
      const { data, error } = await client.storage.from('media').remove([fileName]);
      if (error) {
        console.log(`❌ Failed to remove ${fileName}: ${error.message}`);
      } else if (!data || data.length === 0) {
        console.log(`⚠️ Blocked by RLS (0 items deleted): ${fileName}`);
      } else {
        console.log(`✅ Successfully deleted: ${fileName}`);
      }
    } catch (err) {
      console.log(`❌ Error removing ${fileName}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  if (!serviceKey) {
    console.log('💡 NOTE: If deletions showed "Blocked by RLS", you have two quick options:');
    console.log('  Option 1: Add SUPABASE_SERVICE_ROLE_KEY to your server/.env (Supabase > Settings > API)');
    console.log('  Option 2: Run the SQL in server/database/supabase_storage_setup.sql in your Supabase SQL Editor');
    console.log('='.repeat(70));
  }
}

runCleanup();
