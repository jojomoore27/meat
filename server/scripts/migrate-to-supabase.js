import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const uploadsDir = path.join(__dirname, '../uploads');

async function migrate() {
  console.log('\n========================================================');
  console.log('       MIGRATE ALL UPLOADS TO SUPABASE STORAGE          ');
  console.log('========================================================\n');

  if (!supabaseUrl || (!serviceKey && !anonKey)) {
    console.error('❌ Supabase credentials missing from .env');
    return;
  }

  const client = createClient(supabaseUrl, serviceKey || anonKey);

  // Check bucket accessibility
  const testBuf = Buffer.from('ping');
  const pingName = `.ping_${Date.now()}`;
  const { data: pingData, error: pingErr } = await client.storage.from('media').upload(pingName, testBuf, { upsert: true });
  
  if (pingErr && (pingErr.message?.includes('not found') || pingErr.statusCode === '404')) {
    console.log('⚠️ "media" bucket does not exist in Supabase yet.');
    if (serviceKey) {
      console.log('Creating "media" bucket automatically with service role key...');
      await client.storage.createBucket('media', { public: true });
    } else {
      console.log('👉 Please create the public "media" bucket in Supabase Dashboard first.');
      return;
    }
  } else if (pingErr) {
    console.error('❌ Cannot write to "media" bucket:', pingErr.message);
    return;
  } else {
    // Clean up ping file
    await client.storage.from('media').remove([pingName]);
    console.log('✅ Connected to "media" bucket successfully!');
  }

  if (!fs.existsSync(uploadsDir)) {
    console.log('No local uploads directory found.');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  if (files.length === 0) {
    console.log('ℹ️ No local files in uploads directory to migrate.');
    return;
  }

  console.log(`Found ${files.length} local file(s) in /uploads to migrate to Supabase Storage...`);

  const urlMapping = {};

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    let mime = 'image/jpeg';
    if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.gif') mime = 'image/gif';

    const { data, error } = await client.storage.from('media').upload(file, fileBuffer, {
      contentType: mime,
      upsert: true
    });

    if (!error && data) {
      const { data: pubData } = client.storage.from('media').getPublicUrl(file);
      const newUrl = pubData.publicUrl;
      urlMapping[`/uploads/${file}`] = newUrl;
      console.log(`✅ Uploaded to Supabase: ${file} -> ${newUrl}`);
    } else {
      console.warn(`⚠️ Failed to upload ${file}:`, error?.message);
    }
  }

  console.log('\n🔄 Updating database records to use Supabase Storage URLs...');

  for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
    // 1. Update media_library
    await query('UPDATE media_library SET file_url = $1 WHERE file_url = $2 OR file_url LIKE $3', [newUrl, oldUrl, `%${oldUrl}%`]);

    // 2. Update products main_image
    await query('UPDATE products SET main_image = $1 WHERE main_image = $2 OR main_image LIKE $3', [newUrl, oldUrl, `%${oldUrl}%`]);

    // 3. Update gallery_images
    await query('UPDATE gallery_images SET image_url = $1 WHERE image_url = $2 OR image_url LIKE $3', [newUrl, oldUrl, `%${oldUrl}%`]);
  }

  // Update local_db.json
  const localDbPath = path.join(__dirname, '../database/local_db.json');
  if (fs.existsSync(localDbPath)) {
    let raw = fs.readFileSync(localDbPath, 'utf8');
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      raw = raw.split(oldUrl).join(newUrl);
    }
    fs.writeFileSync(localDbPath, raw, 'utf8');
    console.log('✅ Synchronized local_db.json with new Supabase Storage URLs.');
  }

  console.log('\n🎉 Migration complete! All images are now hosted directly on Supabase Storage.\n');
}

migrate().catch(console.error);
