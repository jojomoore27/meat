import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2] || 'admin@bestgrassfedcattle.com';
const password = process.argv[3] || 'Admin2026!';
const username = process.argv[4] || email.split('@')[0] || 'admin';

async function main() {
  console.log('\n======================================================');
  console.log('       SUPABASE ADMIN LOGIN CREATOR / GENERATOR       ');
  console.log('======================================================\n');
  console.log(`Target Email:    ${email}`);
  console.log(`Target Username: ${username}`);
  console.log(`Target Password: ${password}`);

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  let createdViaApi = false;

  // 1. If service role key is available, create via Supabase Admin API
  if (supabaseUrl && serviceRoleKey) {
    try {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          role: 'admin'
        }
      });

      if (!error && data?.user) {
        console.log('\n✅ Successfully created confirmed admin user directly in Supabase Auth via Service Role API!');
        console.log(`   User ID: ${data.user.id}`);
        createdViaApi = true;
      } else {
        console.warn('\n⚠️ Could not auto-create via Admin API:', error?.message);
      }
    } catch (err) {
      console.warn('\n⚠️ Service role creation failed:', err.message);
    }
  }

  // 2. Update local_db.json fallback
  try {
    const localDbPath = path.join(__dirname, '../database/local_db.json');
    if (fs.existsSync(localDbPath)) {
      const raw = fs.readFileSync(localDbPath, 'utf8');
      const db = JSON.parse(raw);
      if (!Array.isArray(db.admins)) {
        db.admins = [];
      }
      const existingIdx = db.admins.findIndex(a => a.email === email || a.username === username);
      const adminObj = {
        id: existingIdx >= 0 ? db.admins[existingIdx].id : uuidv4(),
        username,
        email,
        password_hash: passwordHash,
        role: 'superadmin'
      };

      if (existingIdx >= 0) {
        db.admins[existingIdx] = adminObj;
      } else {
        db.admins.push(adminObj);
      }

      fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2), 'utf8');
      console.log('✅ Synchronized admin credentials with local database store.');
    }
  } catch (err) {
    console.warn('⚠️ Could not update local_db.json:', err.message);
  }

  console.log('\n------------------------------------------------------');
  console.log('👉 METHOD A: CREATE IN SUPABASE DASHBOARD UI (30s)');
  console.log('------------------------------------------------------');
  console.log(`1. Open your Supabase Dashboard:`);
  console.log(`   ${supabaseUrl || 'https://supabase.com/dashboard'}`);
  console.log(`2. In the left sidebar, click "Authentication" (Users icon).`);
  console.log(`3. Click the "Add user" button in the top right, then "Create user".`);
  console.log(`4. Enter:`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`5. CRUCIAL: Make sure "Auto Confirm User?" is toggled ON.`);
  console.log(`6. Click "Create user".`);
  console.log(`Done! You can now log into your site admin panel using:`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);

  console.log('\n------------------------------------------------------');
  console.log('👉 METHOD B: RUN THIS SQL IN SUPABASE SQL EDITOR (15s)');
  console.log('------------------------------------------------------');
  console.log(`If you prefer running SQL directly in Supabase SQL Editor:`);
  console.log('\nCopy and paste this snippet:\n');
  console.log(`INSERT INTO admins (id, username, email, password_hash, role)`);
  console.log(`VALUES (`);
  console.log(`  gen_random_uuid(),`);
  console.log(`  '${username}',`);
  console.log(`  '${email}',`);
  console.log(`  '${passwordHash}',`);
  console.log(`  'admin'`);
  console.log(`)`);
  console.log(`ON CONFLICT (username) DO UPDATE`);
  console.log(`SET password_hash = EXCLUDED.password_hash, email = EXCLUDED.email;`);
  console.log('\n------------------------------------------------------\n');
}

main().catch(console.error);
