import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { query, queryOne } from './config/db.js';
import galleryRoutes from './routes/gallery.js';
import productRoutes from './routes/products.js';
import { signToken } from './middleware/auth.js';

async function runApiE2eTest() {
  console.log('\n======================================================');
  console.log('       END-TO-END HTTP API INTEGRATION TESTS          ');
  console.log('======================================================\n');

  const app = express();
  app.use(express.json());
  
  // Anti-caching headers on dynamic API routes
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  app.use('/api/gallery', galleryRoutes);
  app.use('/api/products', productRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`📡 Temporary test HTTP server listening on port ${port}`);

  const adminToken = signToken({
    id: 'test-admin-uuid',
    username: 'admin',
    email: 'admin@bestgrassfedcattle.com',
    role: 'superadmin'
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  try {
    // 1. CREATE A TEST POST VIA HTTP API
    console.log('\n--- STEP 1: Admin Creates Post via HTTP POST /api/gallery/admin ---');
    const postPayload = {
      title: 'E2E Controlled Pasture Post ' + Date.now(),
      image_url: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/e2e_pasture_' + Date.now() + '.jpg',
      category: 'grassland',
      is_featured: 1,
      sort_order: 10
    };

    const createRes = await fetch(`${baseUrl}/api/gallery/admin`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(postPayload)
    });

    const createJson = await createRes.json();
    console.log('HTTP POST status:', createRes.status, createJson.success ? 'SUCCESS' : 'FAILED');
    if (!createJson.success || !createJson.image) {
      throw new Error(`Create post failed: ${JSON.stringify(createJson)}`);
    }

    const testPostId = createJson.image.id;
    console.log(`✅ Created test post ID: ${testPostId}`);

    // 2. VERIFY POST APPEARS IN PUBLIC GET /api/gallery
    console.log('\n--- STEP 2: Query Public Catalog via GET /api/gallery ---');
    const getRes = await fetch(`${baseUrl}/api/gallery`);
    const getJson = await getRes.json();
    const foundInCatalog = getJson.images?.find(img => img.id === testPostId);
    console.log('Post found in catalog:', Boolean(foundInCatalog));
    if (!foundInCatalog) throw new Error('New post was not found in public gallery catalog');
    console.log('✅ Post exists and is visible in catalog.');

    // 3. DELETE POST VIA HTTP DELETE /api/gallery/admin/:id
    console.log(`\n--- STEP 3: Admin Deletes Post via HTTP DELETE /api/gallery/admin/${testPostId} ---`);
    const deleteRes = await fetch(`${baseUrl}/api/gallery/admin/${testPostId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deleteJson = await deleteRes.json();
    console.log('HTTP DELETE status:', deleteRes.status, deleteJson);
    if (!deleteJson.success) throw new Error(`Delete endpoint failed: ${JSON.stringify(deleteJson)}`);
    console.log('✅ Post successfully deleted via admin API endpoint.');

    // 4. VERIFY RECORD IS IMMEDIATELY ABSENT IN DATABASE & CATALOG
    console.log('\n--- STEP 4: Authoritative Database & API Absence Check ---');
    const dbCheck = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testPostId]);
    console.log('Direct Database Check:', dbCheck);
    if (dbCheck !== null) throw new Error('Database record was NOT deleted!');

    const getAfterDeleteRes = await fetch(`${baseUrl}/api/gallery`);
    const getAfterDeleteJson = await getAfterDeleteRes.json();
    const foundAfterDelete = getAfterDeleteJson.images?.find(img => img.id === testPostId);
    console.log('Post found in catalog after delete:', Boolean(foundAfterDelete));
    if (foundAfterDelete) throw new Error('Deleted post is still returned by public catalog API!');
    console.log('✅ Confirmed: Post is completely absent from database and API.');

    // 5. TEST DELETING A NON-EXISTENT POST (VERIFY ACCURATE ERROR REPORTING)
    console.log('\n--- STEP 5: Verify Truthful Error on Non-Existent ID Deletion ---');
    const deleteAgainRes = await fetch(`${baseUrl}/api/gallery/admin/${testPostId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deleteAgainJson = await deleteAgainRes.json();
    console.log('HTTP DELETE non-existent status:', deleteAgainRes.status, deleteAgainJson);
    if (deleteAgainRes.status !== 404) throw new Error('Expected 404 status when deleting non-existent ID');
    console.log('✅ Deletion endpoint accurately reports 404 instead of pretending success.');

    // 6. SIMULATE CONTAINER REBOOT / WAKE-UP
    console.log('\n--- STEP 6: Simulate Container Reboot & Re-query ---');
    const { initializeDatabase, ensureDefaultAdmin } = await import('./database/init.js');
    await initializeDatabase();
    await ensureDefaultAdmin();

    const dbCheckAfterReboot = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [testPostId]);
    console.log('Database Check after reboot simulation:', dbCheckAfterReboot);
    if (dbCheckAfterReboot !== null) throw new Error('BUG PERSISTS: Post resurrected after reboot!');
    console.log('✅ Confirmed: Post did NOT return after container reboot.');

    console.log('\n🎉 ALL E2E HTTP INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
  } finally {
    server.close();
  }
}

runApiE2eTest().catch(err => {
  console.error('❌ E2E Test failed:', err);
  process.exit(1);
});
