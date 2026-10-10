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
    const { data: buckets, error: listErr } = await client.storage.listBuckets();
    if (listErr) {
      console.error('❌ Could not list buckets:', listErr.message);
      return;
    }

    console.log(`Found ${buckets.length} storage bucket(s):`, buckets.map(b => b.name));

    const mediaBucket = buckets.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('✅ "media" bucket is active and ready for uploads!');
      console.log(`   Public: ${mediaBucket.public}`);

      // Test upload a 1-pixel test image
      const testBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      const testName = `test_ping_${Date.now()}.gif`;
      const { data: upData, error: upErr } = await client.storage.from('media').upload(testName, testBuffer, {
        contentType: 'image/gif',
        upsert: true
      });

      if (!upErr && upData) {
        const { data: pubData } = client.storage.from('media').getPublicUrl(testName);
        console.log('✅ Test upload succeeded! Public CDN URL:');
        console.log(`   ${pubData.publicUrl}`);
        // Clean up test file
        await client.storage.from('media').remove([testName]);
        console.log('✅ Test file cleaned up successfully.');
      } else {
        console.warn('⚠️ Bucket exists but upload policy check failed:', upErr?.message);
      }
    } else {
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
