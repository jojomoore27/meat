import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, queryOne, supabase } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

/**
 * Extracts the storage key / relative file name from a Supabase Storage or uploads URL.
 */
export function extractStorageKey(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return '';
  const trimmed = fileUrl.trim();
  
  if (trimmed.includes('/storage/v1/object/public/media/')) {
    return trimmed.split('/storage/v1/object/public/media/').pop().split('?')[0];
  }
  if (trimmed.includes('/media/')) {
    return trimmed.split('/media/').pop().split('?')[0];
  }
  if (trimmed.includes('/uploads/')) {
    return trimmed.split('/uploads/').pop().split('?')[0];
  }
  return trimmed.split('/').pop().split('?')[0];
}

/**
 * Checks whether an image is a static bundled farm image or external CDN asset
 * that should NEVER be permanently unlinked from disk or cloud storage.
 */
export function isStaticOrExternalAsset(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return true;
  const trimmed = fileUrl.trim().toLowerCase();
  
  // Static bundled frontend assets
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) return true;
  
  // External CDN assets (Unsplash, etc.)
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('pexels.com') || trimmed.includes('placeholder')) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a media file is exclusively owned by a specific post,
 * ensuring shared or referenced assets are not deleted when a single post is removed.
 */
export async function isMediaExclusivelyOwned(fileUrl, { excludeGalleryId = null, excludeProductId = null } = {}) {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return { isExclusive: false, isStatic: true, reason: 'invalid_url' };
  }

  if (isStaticOrExternalAsset(fileUrl)) {
    return { isExclusive: false, isStatic: true, reason: 'static_or_external_asset' };
  }

  const trimmed = fileUrl.trim();
  const fileName = extractStorageKey(trimmed);

  try {
    // 1. Check other gallery images
    let gallerySql = 'SELECT count(*) as count FROM gallery_images WHERE (image_url = $1 OR image_url LIKE $2)';
    const galleryParams = [trimmed, `%${fileName}%`];
    if (excludeGalleryId) {
      gallerySql += ' AND id != $3';
      galleryParams.push(excludeGalleryId);
    }
    const galleryCheck = await query(gallerySql, galleryParams);
    const galleryCount = parseInt(galleryCheck.rows?.[0]?.count || 0, 10);
    if (galleryCount > 0) {
      return { isExclusive: false, referenceCount: galleryCount, reason: 'referenced_in_gallery' };
    }

    // 2. Check products
    let prodSql = 'SELECT count(*) as count FROM products WHERE (main_image = $1 OR main_image LIKE $2 OR additional_images LIKE $2)';
    const prodParams = [trimmed, `%${fileName}%`];
    if (excludeProductId) {
      prodSql += ' AND id != $3';
      prodParams.push(excludeProductId);
    }
    const prodCheck = await query(prodSql, prodParams);
    const prodCount = parseInt(prodCheck.rows?.[0]?.count || 0, 10);
    if (prodCount > 0) {
      return { isExclusive: false, referenceCount: prodCount, reason: 'referenced_in_products' };
    }

    // 3. Check CMS content
    const cmsCheck = await query('SELECT count(*) as count FROM cms_content WHERE content_json LIKE $1', [`%${fileName}%`]);
    const cmsCount = parseInt(cmsCheck.rows?.[0]?.count || 0, 10);
    if (cmsCount > 0) {
      return { isExclusive: false, referenceCount: cmsCount, reason: 'referenced_in_cms' };
    }

    return { isExclusive: true };
  } catch (err) {
    console.warn('⚠️ Error checking media exclusivity, defaulting to safe preservation:', err.message);
    return { isExclusive: false, reason: 'check_error' };
  }
}

/**
 * Records a failed storage cleanup task for reliable retry later.
 */
export async function recordPendingMediaCleanup(fileUrl, storageKey, errorMessage) {
  try {
    const id = uuidv4();
    await query(
      `INSERT INTO failed_media_cleanups (id, file_url, storage_key, error_message, retry_count, status)
       VALUES ($1, $2, $3, $4, 0, 'pending')`,
      [id, fileUrl, storageKey, errorMessage || 'Unknown storage error']
    );
    console.log(`📝 Recorded pending media cleanup task for retry: ${storageKey} (${id})`);
  } catch (err) {
    console.warn('⚠️ Could not log failed media cleanup to database:', err.message);
  }
}

/**
 * Retries all pending media cleanups that previously failed.
 */
export async function retryPendingMediaCleanups() {
  if (!supabase) return { retried: 0, succeeded: 0 };
  
  try {
    const pending = await query("SELECT * FROM failed_media_cleanups WHERE status = 'pending' AND retry_count < 5");
    if (!pending.rows || pending.rows.length === 0) return { retried: 0, succeeded: 0 };

    let succeeded = 0;
    for (const task of pending.rows) {
      try {
        if (task.storage_key) {
          const { error } = await supabase.storage.from('media').remove([task.storage_key]);
          if (!error) {
            await query("UPDATE failed_media_cleanups SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [task.id]);
            succeeded++;
            console.log(`✅ Retry succeeded for pending media cleanup: ${task.storage_key}`);
            continue;
          }
        }
        await query("UPDATE failed_media_cleanups SET retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [task.id]);
      } catch (e) {
        await query("UPDATE failed_media_cleanups SET retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [task.id]);
      }
    }

    return { retried: pending.rows.length, succeeded };
  } catch (err) {
    console.warn('⚠️ Error executing retryPendingMediaCleanups:', err.message);
    return { retried: 0, succeeded: 0 };
  }
}

/**
 * Safely deletes media associated with a post if and only if it is exclusively owned.
 * Never deletes shared assets, static images, or unrelated post references.
 */
export async function safelyDeletePostMedia(fileUrl, options = {}) {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return { success: false, reason: 'empty_url' };
  }

  const trimmed = fileUrl.trim();
  const fileName = extractStorageKey(trimmed);

  // Check exclusivity unless explicitly forced by admin
  if (!options.force) {
    const check = await isMediaExclusivelyOwned(trimmed, options);
    if (!check.isExclusive) {
      console.log(`ℹ️ Preserving media (${check.reason}): ${fileName}`);
      return { success: true, preserved: true, reason: check.reason };
    }
  }

  console.log(`🗑️ Permanently deleting exclusively owned media: ${fileName}`);

  let storageDeleted = false;
  let localDeleted = false;

  // 1. Delete from Supabase Storage if applicable
  if (supabase && (trimmed.includes('supabase.co') || trimmed.includes('/media/'))) {
    try {
      const { data: delData, error: delErr } = await supabase.storage.from('media').remove([fileName]);
      if (delErr) {
        console.warn(`⚠️ Supabase Storage removal error for ${fileName}:`, delErr.message);
        await recordPendingMediaCleanup(trimmed, fileName, delErr.message);
      } else if (!delData || delData.length === 0) {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.warn(`⚠️ Supabase Storage returned 0 deleted items for ${fileName}. Row-Level Security (RLS) is blocking anon deletes. Use SUPABASE_SERVICE_ROLE_KEY or add RLS DELETE policy.`);
          await recordPendingMediaCleanup(trimmed, fileName, 'RLS policy blocked deletion (0 items deleted)');
        } else {
          console.log(`ℹ️ Supabase Storage file ${fileName} was not present in bucket or already deleted.`);
          storageDeleted = true;
        }
      } else {
        storageDeleted = true;
        console.log(`✅ Permanently removed from Supabase Storage: ${fileName}`);
      }
    } catch (sbErr) {
      console.warn(`⚠️ Supabase Storage removal exception for ${fileName}:`, sbErr.message);
      await recordPendingMediaCleanup(trimmed, fileName, sbErr.message);
    }
  }

  // 2. Delete from local disk uploads directory if applicable
  if (trimmed.includes('/uploads/')) {
    try {
      const localPath = path.join(uploadDir, fileName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        localDeleted = true;
        console.log(`✅ Permanently removed from local disk: ${localPath}`);
      }
    } catch (fsErr) {
      console.warn('Local file unlink error:', fsErr.message);
    }
  }

  // 3. Purge from media_library table
  try {
    await query(
      'DELETE FROM media_library WHERE file_url = $1 OR file_url LIKE $2 OR file_name = $3',
      [trimmed, `%${fileName}%`, fileName]
    );
  } catch (err) {
    console.warn('Media library row purge note:', err.message);
  }

  return { success: true, storageDeleted, localDeleted };
}

/**
 * Backward compatibility alias for existing callers.
 */
export async function permanentlyDeleteMediaFile(fileUrl, options = {}) {
  return safelyDeletePostMedia(fileUrl, options);
}
