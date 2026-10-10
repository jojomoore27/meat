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

async function checkStorage() {
  console.log('\n======================================================');
  console.log('         SUPABASE STORAGE HEALTH & CONFIG CHECK       ');
  console.log('======================================================\n');
  console.log(`Supabase URL: ${supabaseUrl}`);

  const activeKey = serviceKey || anonKey;
  const client = createClient(supabaseUrl, activeKey);

  try {
    // 1. Direct upload test to 'media' bucket
    const testBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const testName = `test_ping_${Date.now()}.gif`;
    const { data: upData, error: upErr } = await client.storage.from('media').upload(testName, testBuffer, {
      contentType: 'image/gif',
      upsert: true
    });

    if (!upErr && upData) {
      const { data: pubData } = client.storage.from('media').getPublicUrl(testName);
      console.log('✅ "media" bucket is active and ready for uploads!');
      console.log('✅ Test upload succeeded! Public CDN URL:');
      console.log(`   ${pubData.publicUrl}`);
      // Clean up test file
      await client.storage.from('media').remove([testName]);
      console.log('✅ Test file cleaned up successfully.');
      console.log('\n🎉 Supabase Storage is 100% operational and ready to receive pictures!\n');
      return;
    }

    if (upErr && (upErr.message?.includes('not found') || upErr.statusCode === '404')) {
      console.log('⚠️ "media" bucket does not exist yet in Supabase.');
      if (serviceKey) {
        console.log('Attempting auto-creation via Service Role key...');
        const { data: newBucket, error: createErr } = await client.storage.createBucket('media', {
          public: true,
          fileSizeLimit: 15728640,
        });
        if (!createErr) {
          console.log('✅ Successfully auto-created "media" bucket in Supabase!');
        } else {
          console.warn('Could not auto-create bucket:', createErr.message);
        }
      } else {
        console.log('\n👉 TO ENABLE SUPABASE STORAGE (15 Seconds):');
        console.log('Option 1: In Supabase Dashboard > Storage > Click "New Bucket" > Name it "media" > Toggle "Public" ON > Save.');
        console.log('Option 2: In Supabase Dashboard > SQL Editor > Run server/database/supabase_storage_setup.sql.');
      }
    }
  } catch (err) {
    console.error('Error checking storage:', err);
  }
}

checkStorage();
