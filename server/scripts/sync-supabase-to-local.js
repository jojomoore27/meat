import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const localDbPath = path.join(__dirname, '../database/local_db.json');

async function syncCloudToLocal() {
  console.log('🔄 Syncing Supabase Cloud tables to server/database/local_db.json...');

  const tables = [
    'admins', 'categories', 'products', 'order_requests', 'wholesale_requests',
    'contact_messages', 'faqs', 'testimonials', 'gallery_images', 'media_library',
    'site_settings', 'cms_content', 'notification_settings', 'admin_notifications',
    'notification_logs', 'failed_media_cleanups'
  ];

  const db = {
    deleted_records: []
  };

  for (const t of tables) {
    const { data, error } = await client.from(t).select('*');
    if (error) {
      console.warn(`Error fetching ${t}:`, error.message);
      db[t] = [];
    } else {
      db[t] = data || [];
      console.log(`✅ Table ${t}: synced ${db[t].length} records from Supabase Cloud`);
    }
  }

  fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('🎉 local_db.json successfully synchronized 1:1 with Supabase Cloud!');
}

syncCloudToLocal();
