import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, supabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

/**
 * Permanently deletes a media file from Supabase Storage, local disk,
 * and purges references across products, galleries, and media library.
 */
export async function permanentlyDeleteMediaFile(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  const trimmed = fileUrl.trim();
  const fileName = trimmed.split('/').pop().split('?')[0];

  console.log(`🗑️ Initiating permanent deletion for image: ${fileName} (${trimmed})`);

  // 1. Delete from Supabase Storage if applicable
  if (supabase && (trimmed.includes('/storage/v1/object/public/media/') || trimmed.includes('/media/'))) {
    try {
      const storageKey = trimmed.includes('/media/') ? trimmed.split('/media/').pop().split('?')[0] : fileName;
      if (storageKey) {
        const { error } = await supabase.storage.from('media').remove([storageKey]);
        if (error) {
          console.warn('Supabase storage removal note:', error.message);
        } else {
          console.log(`✅ Permanently removed from Supabase Storage: ${storageKey}`);
        }
      }
    } catch (sbErr) {
      console.warn('Supabase storage delete error:', sbErr.message);
    }
  }

  // 2. Delete from local disk uploads directory
  if (trimmed.includes('/uploads/')) {
    try {
      const localFileName = trimmed.split('/uploads/').pop().split('?')[0];
      const localPath = path.join(uploadDir, localFileName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`✅ Permanently removed file from local disk: ${localPath}`);
      }
    } catch (fsErr) {
      console.warn('Local file unlink error:', fsErr.message);
    }
  }

  // 3. Purge matching entries from media_library table
  try {
    await query(
      'DELETE FROM media_library WHERE file_url = $1 OR file_url LIKE $2 OR file_name = $3',
      [trimmed, `%${fileName}%`, fileName]
    );
  } catch (err) {
    console.warn('Media library row purge error:', err.message);
  }

  // 4. Clear references from products table
  try {
    // Clear main_image if pointing to this file
    await query(
      'UPDATE products SET main_image = $1 WHERE main_image = $2 OR main_image LIKE $3',
      ['/images/artisanal_ribeye_steak.jpg', trimmed, `%${fileName}%`]
    );

    // Clean up additional_images JSON array if this file was in it
    const prods = await query('SELECT id, additional_images FROM products');
    if (prods && prods.rows) {
      for (const p of prods.rows) {
        let imgs = [];
        try {
          imgs = typeof p.additional_images === 'string' ? JSON.parse(p.additional_images || '[]') : p.additional_images;
        } catch (e) {
          imgs = [];
        }

        if (Array.isArray(imgs) && imgs.some(img => img === trimmed || img.includes(fileName))) {
          const updatedImgs = imgs.filter(img => img !== trimmed && !img.includes(fileName));
          await query('UPDATE products SET additional_images = $1 WHERE id = $2', [JSON.stringify(updatedImgs), p.id]);
        }
      }
    }
  } catch (err) {
    console.warn('Product image reference cleanup error:', err.message);
  }

  // 5. Delete matching records from gallery_images table
  try {
    await query(
      'DELETE FROM gallery_images WHERE image_url = $1 OR image_url LIKE $2',
      [trimmed, `%${fileName}%`]
    );
  } catch (err) {
    console.warn('Gallery reference cleanup error:', err.message);
  }
}
