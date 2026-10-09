import { query, getDbMode } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function initializeDatabase() {
  console.log(`🔄 Initializing database schema in [${getDbMode()}] mode...`);

  // Compatible schema execution for SQLite & PostgreSQL
  const isPostgres = getDbMode() === 'postgres';

  const idType = isPostgres ? 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()' : 'TEXT PRIMARY KEY';
  const jsonType = isPostgres ? 'JSONB' : 'TEXT';
  const timestampType = isPostgres ? 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  if (isPostgres) {
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  }

  // 1. Admins
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id ${idType},
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at ${timestampType},
      updated_at ${timestampType}
    )
  `);

  // 2. Categories
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id ${idType},
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at ${timestampType}
    )
  `);

  // 3. Products
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id ${idType},
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category_id TEXT,
      price REAL NOT NULL DEFAULT 0.00,
      short_description TEXT NOT NULL,
      full_description TEXT,
      main_image TEXT NOT NULL,
      additional_images ${jsonType} DEFAULT '[]',
      status TEXT DEFAULT 'published',
      is_featured INTEGER DEFAULT 0,
      cut_options ${jsonType} DEFAULT '[]',
      specifications ${jsonType} DEFAULT '{}',
      seo_title TEXT,
      seo_description TEXT,
      created_at ${timestampType},
      updated_at ${timestampType}
    )
  `);

  // 4. Order Requests
  await query(`
    CREATE TABLE IF NOT EXISTS order_requests (
      id ${idType},
      reference_no TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      contact_preference TEXT DEFAULT 'email',
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      cut_preference TEXT,
      special_instructions TEXT,
      additional_notes TEXT,
      status TEXT DEFAULT 'new',
      admin_notes TEXT,
      ip_address TEXT,
      created_at ${timestampType},
      updated_at ${timestampType}
    )
  `);

  // 5. Wholesale Requests
  await query(`
    CREATE TABLE IF NOT EXISTS wholesale_requests (
      id ${idType},
      reference_no TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      products_interested TEXT NOT NULL,
      estimated_quantity TEXT NOT NULL,
      preferred_cuts TEXT,
      purchase_frequency TEXT,
      additional_requirements TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      admin_notes TEXT,
      created_at ${timestampType},
      updated_at ${timestampType}
    )
  `);

  // 6. Contact Messages
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id ${idType},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      admin_notes TEXT,
      created_at ${timestampType}
    )
  `);

  // 7. FAQs
  await query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id ${idType},
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at ${timestampType}
    )
  `);

  // 8. Testimonials
  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id ${idType},
      customer_name TEXT NOT NULL,
      customer_role TEXT,
      quote TEXT NOT NULL,
      photo_url TEXT,
      is_featured INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at ${timestampType}
    )
  `);

  // 9. Gallery Images
  await query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id ${idType},
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'farm',
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at ${timestampType}
    )
  `);

  // 10. Media Library
  await query(`
    CREATE TABLE IF NOT EXISTS media_library (
      id ${idType},
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      tags TEXT,
      uploaded_at ${timestampType}
    )
  `);

  // 11. Site Settings
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      business_name TEXT DEFAULT 'BestGrassFedCattle',
      tagline TEXT DEFAULT 'Premium Grass-Fed Beef, Raised With Purpose.',
      location TEXT DEFAULT 'Kansas, United States',
      currency TEXT DEFAULT 'USD ($)',
      contact_email TEXT DEFAULT 'grassfed@gmail.com',
      contact_phone TEXT DEFAULT '+1 (305) 213-2655',
      address TEXT DEFAULT '2210 SE 21st St, Topeka, KS 66607',
      social_links ${jsonType} DEFAULT '{}',
      brand_description TEXT DEFAULT 'Ethically raised 100% grass-fed and grass-finished cattle from pristine Kansas pastures.',
      logo_url TEXT,
      favicon_url TEXT,
      theme_default TEXT DEFAULT 'system',
      updated_at ${timestampType}
    )
  `);

  // 12. CMS Content
  await query(`
    CREATE TABLE IF NOT EXISTS cms_content (
      id TEXT PRIMARY KEY,
      page_key TEXT NOT NULL,
      section_key TEXT NOT NULL,
      content_json ${jsonType} NOT NULL,
      updated_at ${timestampType}
    )
  `);

  // 13. Notification Settings
  await query(`
    CREATE TABLE IF NOT EXISTS notification_settings (
      id TEXT PRIMARY KEY,
      admin_dashboard_enabled INTEGER DEFAULT 1,
      email_enabled INTEGER DEFAULT 0,
      email_recipient TEXT DEFAULT 'grassfed@gmail.com',
      smtp_host TEXT,
      smtp_port INTEGER DEFAULT 587,
      smtp_user TEXT,
      smtp_password TEXT,
      smtp_secure INTEGER DEFAULT 0,
      telegram_enabled INTEGER DEFAULT 0,
      telegram_bot_token TEXT,
      telegram_chat_id TEXT,
      whatsapp_enabled INTEGER DEFAULT 0,
      whatsapp_phone_id TEXT,
      whatsapp_access_token TEXT,
      whatsapp_recipient_phone TEXT,
      livechat_enabled INTEGER DEFAULT 0,
      livechat_webhook_url TEXT,
      updated_at ${timestampType}
    )
  `);

  // 14. Admin Notifications
  await query(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id ${idType},
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'order_request',
      reference_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at ${timestampType}
    )
  `);

  // 15. Notification Logs
  await query(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id ${idType},
      event_type TEXT NOT NULL,
      reference_no TEXT,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      payload ${jsonType},
      created_at ${timestampType}
    )
  `);

  console.log('✅ Database tables initialized successfully.');
}
