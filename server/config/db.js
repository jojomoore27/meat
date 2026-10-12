import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { executeLocalSql, initializeLocalDbWithCloud } from './localDb.js';

dotenv.config();

const { Pool } = pg;

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
);

export const isPostgresConfigured = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);

/**
 * Checks if a database connection URL points to a Render internal private service
 */
export function isRenderInternalUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return false;
  return urlStr.includes('dpg-') && !urlStr.includes('.render.com');
}

/**
 * Normalizes PostgreSQL connection strings for seamless compatibility on Render.
 * 
 * Specifically solves:
 * 1. Render IPv6 limitation: Direct Supabase hostname `db.<ref>.supabase.co` is IPv6-only
 *    and fails on Render with ENETUNREACH / ENODATA.
 *    Auto-converts to Supabase IPv4 Pooler: `aws-0-eu-west-1.pooler.supabase.com:5432`.
 * 2. Supabase Pooler Username: Auto-appends `.<projectRef>` to username if missing
 *    (preventing "Tenant or user not found" errors).
 * 3. Render Internal DB: Auto-detects Render private network URLs (dpg-*) and removes conflicting SSL options.
 */
export function normalizePostgresUrl(rawUrl, defaultProjectRef = 'vorsgkntunffzgulwumc') {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let urlStr = rawUrl.trim();

  // Pattern A: Direct Supabase host db.<ref>.supabase.co
  // Direct Supabase host is IPv6-only. Render is IPv4-only, so direct connections fail.
  // Convert to Supabase Session Pooler (IPv4 compatible on port 5432).
  const directMatch = urlStr.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/([^?]+)(\?.*)?$/i);
  if (directMatch) {
    const [, user, password, projectRef, dbName] = directMatch;
    const poolerHost = 'aws-0-eu-west-1.pooler.supabase.com';
    const poolerUser = user.includes('.') ? user : `${user}.${projectRef}`;
    const cleanDb = dbName || 'postgres';
    console.log(`🔄 Auto-converting Supabase IPv6 direct host (db.${projectRef}.supabase.co) -> Render IPv4 Pooler (${poolerHost}:5432)`);
    return `postgresql://${poolerUser}:${password}@${poolerHost}:5432/${cleanDb}`;
  }

  // Pattern B: Supabase pooler host (*.pooler.supabase.com), but username is missing the projectRef
  // If user copied pooler string but username is just 'postgres', pooler fails with "Tenant or user not found"
  const poolerMatch = urlStr.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@(aws-[^:]+\.pooler\.supabase\.com)(?::(\d+))?\/([^?]+)(\?.*)?$/i);
  if (poolerMatch) {
    let [, user, password, poolerHost, port, dbName] = poolerMatch;
    if (!user.includes('.') && defaultProjectRef) {
      console.log(`🔄 Auto-appending project ref to pooler username (${user} -> ${user}.${defaultProjectRef})...`);
      user = `${user}.${defaultProjectRef}`;
      const targetPort = port || '5432';
      const cleanDb = dbName || 'postgres';
      return `postgresql://${user}:${password}@${poolerHost}:${targetPort}/${cleanDb}`;
    }
  }

  // Pattern C: Render internal DB URLs (dpg-xxxxxx-a)
  // Ensure protocol is postgresql:// and strip incompatible sslmode params
  if (isRenderInternalUrl(urlStr)) {
    urlStr = urlStr.replace(/^postgres:\/\//, 'postgresql://');
    urlStr = urlStr.replace(/([?&])sslmode=[^&]+/g, '');
    urlStr = urlStr.replace(/\?$/, '');
  }

  return urlStr;
}

let supabase = null;
let pgPool = null;
let dbMode = 'local';
let dbConnectionStatus = {
  connected: false,
  mode: 'uninitialized',
  message: 'Database not initialized yet.',
  checkedAt: null
};

// Initialize Supabase Storage/Auth client if credentials exist
if (isSupabaseConfigured) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`✅ Supabase client connected to ${supabaseUrl}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
}

/**
 * Authoritative connection initializer.
 * Awaited during server startup before schema initialization.
 */
export async function connectDb() {
  if (isSupabaseConfigured) {
    try {
      console.log('☁️ Synchronizing authoritative state with Supabase Cloud...');
      await initializeLocalDbWithCloud();
    } catch (err) {
      console.warn('⚠️ Supabase Cloud sync warning:', err.message);
    }
  }

  if (!isPostgresConfigured) {
    dbMode = 'local';
    dbConnectionStatus = {
      connected: true,
      mode: 'supabase_cloud_sync',
      message: 'Supabase Cloud storage and tables active as permanent source of truth.',
      checkedAt: new Date().toISOString()
    };
    console.log('📁 Supabase Cloud synchronized source of truth active.');
    return;
  }

  const rawUrl = process.env.DATABASE_URL;
  const normalizedUrl = normalizePostgresUrl(rawUrl);
  const isInternal = isRenderInternalUrl(normalizedUrl);

  try {
    console.log('🔌 Connecting to PostgreSQL pool...');
    pgPool = new Pool({
      connectionString: normalizedUrl,
      ssl: isInternal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10
    });

    // Test connection with a fast probe query
    const res = await pgPool.query('SELECT 1 as connected');
    if (res && res.rows) {
      dbMode = 'postgres';
      dbConnectionStatus = {
        connected: true,
        mode: 'postgres',
        message: 'Successfully connected and verified PostgreSQL database pool.',
        checkedAt: new Date().toISOString()
      };
      console.log('✅ Connected and verified PostgreSQL database pool.');
    }
  } catch (err) {
    dbMode = 'local';
    dbConnectionStatus = {
      connected: false,
      mode: 'local_fallback',
      message: `PostgreSQL connection error: ${err.message}`,
      checkedAt: new Date().toISOString()
    };
    console.warn(`⚠️ PostgreSQL connection failed: ${err.message}`);
    console.warn('   💡 Render Database Troubleshooting:');
    console.warn('      1. If connecting to Supabase: Render is IPv4-only and cannot reach direct "db.xxxx.supabase.co".');
    console.warn('         Use the Supabase IPv4 Pooler URL (aws-0-eu-west-1.pooler.supabase.com:5432).');
    console.warn('      2. Username for the pooler MUST include your project ref: postgres.<PROJECT_REF>');
    console.warn('      3. If your password has special characters like @, #, $, URL-encode them (e.g. @ -> %40).');
    console.warn('      4. If connecting to a Render PostgreSQL instance: use the "Internal Database URL" on Render.');
    console.warn('   📁 App is continuing in safe local storage mode with persistent tombstone deletion protection.');
  }
}

export function getDbMode() {
  return dbMode;
}

export function getDbStatus() {
  return {
    dbMode,
    isPostgresConfigured,
    isSupabaseConfigured,
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrl: process.env.SUPABASE_URL || null,
    connection: dbConnectionStatus
  };
}

export { supabase, pgPool };

/**
 * Universal Query Runner with Parameterized protection against SQL Injection
 * Automatically adapts between PostgreSQL ($1, $2) and Local Store
 */
export async function query(sql, params = []) {
  if (pgPool && dbConnectionStatus.connected) {
    try {
      const res = await pgPool.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount };
    } catch (err) {
      // If pool disconnects or errors, log and gracefully fall back to local store
      console.error('PostgreSQL query error, falling back to safe local store:', err.message);
      return executeLocalSql(sql, params);
    }
  }

  // Local engine with persistent tombstone deletion protection
  return executeLocalSql(sql, params);
}

/**
 * Universal Single Row Helper
 */
export async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}
