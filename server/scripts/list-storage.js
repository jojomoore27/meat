import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function listFiles() {
  const { data, error } = await client.storage.from('media').list('', { limit: 100 });
  if (error) {
    console.error('Error listing files:', error);
  } else {
    console.log('CURRENT SUPABASE FILES:');
    console.log(JSON.stringify(data, null, 2));
  }
}

listFiles();
