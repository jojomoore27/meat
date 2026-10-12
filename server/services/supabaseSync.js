import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

let supabaseAdmin = null;

if (supabaseUrl && (serviceKey || anonKey)) {
  try {
    supabaseAdmin = createClient(supabaseUrl, serviceKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } catch (err) {
    console.warn('⚠️ Supabase sync client failed to initialize:', err.message);
  }
}

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

/**
 * Reconciles Supabase Storage 'media' bucket with local database tables.
 * Guarantees that:
 * 1. Only files existing in Supabase Storage are shown in the website media library.
 * 2. Any file deleted from Supabase Storage is removed from products, gallery, and media_library.
 * 3. All files present in Supabase Storage are registered in media_library.
 */
export async function reconcileStorageWithDatabase(db) {
  if (!supabaseAdmin) return;

  try {
    console.log('🔄 Reconciling Supabase Storage source of truth with database...');
    const { data: storageFiles, error } = await supabaseAdmin.storage.from('media').list('', { limit: 200 });
    if (error) {
      console.warn('⚠️ Could not list Supabase Storage files during reconciliation:', error.message);
      return;
    }

    if (!Array.isArray(storageFiles)) return;

    const liveFileNames = new Set(storageFiles.map(f => f.name));
    console.log(`📡 Live Supabase Storage contains ${liveFileNames.size} files:`, Array.from(liveFileNames).join(', '));

    // 1. Purge records from media_library if file is not in Supabase Storage
    if (Array.isArray(db.media_library)) {
      const initialMediaCount = db.media_library.length;
      db.media_library = db.media_library.filter(m => {
        if (!m || !m.file_url) return false;
        if (m.file_url.includes('supabase.co')) {
          const fileName = m.file_url.split('/').pop().split('?')[0];
          return liveFileNames.has(fileName);
        }
        // Purge any legacy /uploads/ or demo references
        return false;
      });
      if (db.media_library.length !== initialMediaCount) {
        console.log(`🧹 Purged ${initialMediaCount - db.media_library.length} obsolete media entries.`);
      }
    }

    // 2. Ensure every file in live Supabase Storage is in media_library
    const registeredUrls = new Set((db.media_library || []).map(m => m.file_url));
    for (const f of storageFiles) {
      const pub = supabaseAdmin.storage.from('media').getPublicUrl(f.name);
      const publicUrl = pub?.data?.publicUrl;
      if (publicUrl && !registeredUrls.has(publicUrl)) {
        const newRecord = {
          id: uuidv4(),
          file_name: f.name,
          file_url: publicUrl,
          file_type: f.metadata?.mimetype || 'image/jpeg',
          file_size: f.metadata?.size || 0,
          tags: 'supabase, live',
          uploaded_at: f.created_at || new Date().toISOString()
        };
        db.media_library.push(newRecord);
        registeredUrls.add(publicUrl);
        console.log(`➕ Registered missing storage file into media library: ${f.name}`);
        // Upsert to Supabase table as well
        await supabaseAdmin.from('media_library').upsert([newRecord], { onConflict: 'file_url' }).catch(() => {});
      }
    }

    // 3. Purge gallery images pointing to deleted or non-existent files
    if (Array.isArray(db.gallery_images)) {
      db.gallery_images = db.gallery_images.filter(g => {
        if (!g || !g.image_url) return false;
        if (g.image_url.includes('supabase.co')) {
          const fileName = g.image_url.split('/').pop().split('?')[0];
          return liveFileNames.has(fileName);
        }
        // Purge external stock images (Unsplash, etc.)
        return false;
      });
    }

    // 4. Ensure products do not point to deleted files
    if (Array.isArray(db.products)) {
      const liveUrls = Array.from(registeredUrls);
      const defaultLiveUrl = liveUrls[0] || 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760498806_743.jpeg';
      db.products.forEach(p => {
        if (p.main_image && p.main_image.includes('supabase.co')) {
          const fileName = p.main_image.split('/').pop().split('?')[0];
          if (!liveFileNames.has(fileName)) {
            console.warn(`⚠️ Product "${p.name}" pointed to deleted storage image ${fileName}. Reassigning to live asset.`);
            p.main_image = defaultLiveUrl;
          }
        } else if (!p.main_image || !p.main_image.includes('supabase.co')) {
          p.main_image = defaultLiveUrl;
        }
      });
    }

    console.log('✅ Supabase Storage reconciliation complete.');
  } catch (err) {
    console.warn('⚠️ Storage reconciliation error:', err.message);
  }
}

/**
 * Synchronizes in-memory database from Supabase Cloud persistent tables.
 */
export async function pullFromSupabaseCloud(db) {
  if (!supabaseAdmin) return false;

  try {
    console.log('☁️ Pulling persistent state from Supabase Cloud tables...');
    const tables = [
      'admins', 'categories', 'products', 'gallery_images', 'media_library',
      'site_settings', 'cms_content', 'faqs', 'testimonials', 'notification_settings'
    ];

    let hasData = false;

    for (const t of tables) {
      const { data, error } = await supabaseAdmin.from(t).select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        db[t] = data;
        hasData = true;
        console.log(`  • Synced ${data.length} records for table [${t}]`);
      }
    }

    if (hasData) {
      console.log('🎉 Successfully synchronized in-memory database with Supabase Cloud.');
      await reconcileStorageWithDatabase(db);
      return true;
    }
  } catch (err) {
    console.warn('⚠️ Could not pull from Supabase Cloud:', err.message);
  }
  return false;
}

/**
 * Pushes a mutation to Supabase Cloud so persistence survives Render restarts.
 */
export async function pushMutationToSupabase(tableName, operation, data, filterId = null) {
  if (!supabaseAdmin) return;

  try {
    if (operation === 'insert' || operation === 'update') {
      const record = { ...data };
      // Convert nested objects to JSON strings if needed
      for (const k of Object.keys(record)) {
        if (record[k] !== null && typeof record[k] === 'object' && !Array.isArray(record[k])) {
          record[k] = JSON.stringify(record[k]);
        }
      }
      await supabaseAdmin.from(tableName).upsert([record], { onConflict: 'id' });
    } else if (operation === 'delete') {
      const id = filterId || data?.id;
      if (id) {
        await supabaseAdmin.from(tableName).delete().eq('id', id);
        console.log(`☁️ Synced authoritative deletion to Supabase Cloud table [${tableName}], id: ${id}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Cloud mutation sync error for [${tableName}]:`, err.message);
  }
}
