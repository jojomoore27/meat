import dotenv from 'dotenv';
import dns from 'dns/promises';
import net from 'net';
import pg from 'pg';
import { normalizePostgresUrl } from '../config/db.js';

dotenv.config();

const { Pool } = pg;

function maskUrl(urlStr) {
  if (!urlStr) return '';
  return urlStr.replace(/:([^:@]+)@/, ':****@');
}

async function runDiagnostics() {
  console.log('='.repeat(70));
  console.log('🔍 BestGrassFedCattle - PostgreSQL on Render Diagnostic Tool');
  console.log('='.repeat(70));

  const inputUrl = process.argv[2] || process.env.DATABASE_URL;

  if (!inputUrl) {
    console.error('❌ No DATABASE_URL provided!');
    console.log('\nUsage:');
    console.log('  node scripts/test-db-connection.js "postgresql://user:password@host:port/dbname"');
    console.log('  OR set DATABASE_URL in your server/.env file');
    process.exit(1);
  }

  console.log(`\n📋 Provided Connection URL: ${maskUrl(inputUrl)}`);

  // 1. Normalize
  const normalizedUrl = normalizePostgresUrl(inputUrl);
  if (normalizedUrl !== inputUrl) {
    console.log(`🔄 Normalized Connection URL: ${maskUrl(normalizedUrl)}`);
  }

  // 2. Parse Host & Port
  let parsedHost = '';
  let parsedPort = 5432;
  try {
    const dummyUrl = normalizedUrl.replace(/^postgres(?:ql)?:\/\//, 'http://');
    const u = new URL(dummyUrl);
    parsedHost = u.hostname;
    parsedPort = parseInt(u.port, 10) || 5432;
  } catch (err) {
    console.error(`❌ Could not parse connection URL: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n🌐 Host Target: ${parsedHost}`);
  console.log(`🔌 Port Target: ${parsedPort}`);

  // 3. DNS Diagnostics
  console.log('\n🔎 Step 1: DNS Resolution Check...');
  let hasIpv4 = false;
  let hasIpv6 = false;

  try {
    const v4 = await dns.resolve4(parsedHost);
    console.log(`   ✅ IPv4 Addresses found: ${v4.join(', ')}`);
    hasIpv4 = true;
  } catch (err) {
    console.log(`   ⚠️ No IPv4 address found for ${parsedHost} (${err.code})`);
  }

  try {
    const v6 = await dns.resolve6(parsedHost);
    console.log(`   ℹ️ IPv6 Addresses found: ${v6.join(', ')}`);
    hasIpv6 = true;
  } catch (err) {
    // Expected for some hosts
  }

  if (!hasIpv4 && hasIpv6) {
    console.warn('\n🚨 CRITICAL RENDER INCOMPATIBILITY DETECTED:');
    console.warn(`   Target host "${parsedHost}" only has IPv6 records.`);
    console.warn(`   Render web services do NOT support outbound IPv6 traffic.`);
    console.warn(`   If this is Supabase, you MUST use the IPv4 Pooler host instead:`);
    console.warn(`   👉 aws-0-eu-west-1.pooler.supabase.com (port 5432 or 6543)`);
  }

  // 4. TCP Socket Check
  console.log(`\n🔎 Step 2: TCP Reachability Check (${parsedHost}:${parsedPort})...`);
  const tcpSuccess = await new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 6000;
    socket.setTimeout(timeout);

    socket.connect(parsedPort, parsedHost, () => {
      console.log(`   ✅ Successfully established TCP connection to ${parsedHost}:${parsedPort}`);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      console.log(`   ❌ TCP connection failed: ${err.message}`);
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      console.log(`   ❌ TCP connection timed out after ${timeout}ms`);
      socket.destroy();
      resolve(false);
    });
  });

  if (!tcpSuccess) {
    console.error('\n❌ Could not establish network connection to database host.');
    console.log('\n💡 Common Causes:');
    console.log('   1. Host has no IPv4 address (common with direct db.<ref>.supabase.co on Render).');
    console.log('   2. Firewall blocking port or incorrect port specified.');
    console.log('   3. If using Render Native Postgres internal URL outside of Render, internal URLs only resolve INSIDE Render.');
    process.exit(1);
  }

  // 5. Database Authentication & Query
  console.log('\n🔎 Step 3: PostgreSQL Authentication & Query Check...');
  const isInternal = parsedHost.startsWith('dpg-') && !parsedHost.includes('.render.com');
  const pool = new Pool({
    connectionString: normalizedUrl,
    ssl: isInternal ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000
  });

  try {
    const client = await pool.connect();
    console.log('   ✅ PostgreSQL authentication successful!');

    const res = await client.query('SELECT version(), current_database(), current_user, NOW() as server_time');
    console.log(`   📊 Connected Database: ${res.rows[0].current_database}`);
    console.log(`   👤 Connected User: ${res.rows[0].current_user}`);
    console.log(`   ⏰ DB Server Time: ${res.rows[0].server_time}`);
    console.log(`   🐘 Engine: ${res.rows[0].version.split(',')[0]}`);

    // Check tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(`\n📋 Existing Tables (${tableNames.length}): ${tableNames.length > 0 ? tableNames.join(', ') : '(None yet - will be auto-created on server start)'}`);

    client.release();
    await pool.end();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALL CHECKS PASSED! This database URL is fully functional for Render.');
    console.log('='.repeat(70));
  } catch (err) {
    console.error(`\n❌ PostgreSQL Query/Auth Error: ${err.message}`);
    console.log('\n💡 Troubleshooting:');
    if (err.message.includes('password authentication failed')) {
      console.log('   • Password is incorrect or contains unencoded special characters.');
      console.log('   • In Supabase: Go to Project Settings -> Database -> Reset database password.');
      console.log('   • Remember to URL-encode characters like @, #, $, %, &:');
      console.log('     e.g., replace "@" with "%40" in the password part of the URL.');
    } else if (err.message.includes('Tenant or user not found')) {
      console.log('   • When using Supabase Pooler, the username MUST include your project ref:');
      console.log('     Format: postgres.<PROJECT_REF> (e.g., postgres.vorsgkntunffzgulwumc)');
    } else if (err.message.includes('no pg_hba.conf entry') || err.message.includes('SSL')) {
      console.log('   • SSL certificate negotiation issue. Ensure ssl: { rejectUnauthorized: false } is used.');
    }
    process.exit(1);
  }
}

runDiagnostics().catch(err => {
  console.error('Fatal error during diagnostics:', err);
  process.exit(1);
});
