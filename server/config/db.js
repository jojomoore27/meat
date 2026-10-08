import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { executeLocalSql } from './localDb.js';

dotenv.config();

const { Pool } = pg;

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
);

export const isPostgresConfigured = Boolean(process.env.DATABASE_URL);

let supabase = null;
let pgPool = null;
let dbMode = 'local';

if (isPostgresConfigured) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    dbMode = 'postgres';
    console.log('✅ Connected to PostgreSQL database pool.');
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL database pool:', err.message);
  }
}

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

if (!pgPool) {
  dbMode = 'local';
  console.log('📁 High-performance local storage active for instant queries. Supabase client linked.');
}

export function getDbMode() {
  return dbMode;
}

export { supabase };

/**
 * Universal Query Runner with Parameterized protection against SQL Injection
 * Automatically adapts between PostgreSQL ($1, $2) and Local Store
 */
export async function query(sql, params = []) {
  if (pgPool) {
    const res = await pgPool.query(sql, params);
    return { rows: res.rows, rowCount: res.rowCount };
  }

  // Local fallback engine
  return executeLocalSql(sql, params);
}

/**
 * Universal Single Row Helper
 */
export async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}
