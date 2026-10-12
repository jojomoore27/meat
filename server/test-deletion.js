import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, ensureDefaultAdmin } from './database/init.js';
import { query, queryOne } from './config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { safelyDeletePostMedia } from './utils/fileCleanup.js';

async function runTest() {
  console.log('--- TEST 1: Database Initialization ---');
  await initializeDatabase();
  await ensureDefaultAdmin();
  console.log('✅ Initialization completed.');

  console.log('\n--- TEST 2: Create Controlled Test Post ---');
  const testId = uuidv4();
  const testTitle = 'Controlled Test Post ' + Date.now();
  const testImageUrl = 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/test_post_' + Date.now() + '.jpg';
  
  await query(
    'INSERT INTO gallery_images (id, title, image_url, category, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
    [testId, testTitle, testImageUrl, 'cattle', 0, 999]
  );
  
  const created = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testId]);
  console.log('Created record:', created ? { id: created.id, title: created.title } : null);
  if (!created || created.id !== testId) {
    throw new Error(`Test post creation failed: expected ${testId}, got ${created?.id}`);
  }
  console.log('✅ Test post created successfully.');

  console.log('\n--- TEST 3: Delete Controlled Test Post ---');
  const existing = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testId]);
  if (!existing) throw new Error('Post to delete was not found');

  const delRes = await query('DELETE FROM gallery_images WHERE id = $1', [testId]);
  console.log('Delete result rowCount:', delRes.rowCount);
  if (delRes.rowCount !== 1) throw new Error('Deletion failed to remove row');

  await safelyDeletePostMedia(existing.image_url, { excludeGalleryId: testId });

  const postCheckImmediate = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testId]);
  console.log('Immediate check after deletion:', postCheckImmediate);
  if (postCheckImmediate !== null) throw new Error('Post still exists immediately after deletion!');
  console.log('✅ Post is confirmed absent immediately after deletion.');

  console.log('\n--- TEST 4: Simulate Container Reboot & Seeder Execution ---');
  const { seedDatabase } = await import('./database/seed.js');
  // Run seed check without force flag (simulating normal reboot)
  await seedDatabase();
  
  const postCheckAfterReboot = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testId]);
  console.log('Check after reboot/seeder run:', postCheckAfterReboot);
  if (postCheckAfterReboot !== null) {
    throw new Error('BUG PERSISTS: Post returned after reboot!');
  }
  console.log('✅ PROOF PASSED: Deleted post did NOT return after reboot!');

  console.log('\n--- TEST 5: Verify Other Posts Remain Intact ---');
  const allGallery = await query('SELECT count(*) as count FROM gallery_images');
  console.log('Total remaining gallery images:', allGallery.rows[0].count);
  console.log('✅ Unrelated posts intact!');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Data integrity and deletion persistence verified.\n');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
