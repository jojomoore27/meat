import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function checkAllTables() {
  const tables = [
    'admins', 'categories', 'products', 'order_requests', 'wholesale_requests',
    'contact_messages', 'faqs', 'testimonials', 'gallery_images', 'media_library',
    'site_settings', 'cms_content', 'notification_settings', 'admin_notifications',
    'notification_logs', 'failed_media_cleanups'
  ];

  for (const t of tables) {
    const { count, error } = await client.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${t}: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ ${t}: exists (count: ${count})`);
    }
  }
}

checkAllTables();
