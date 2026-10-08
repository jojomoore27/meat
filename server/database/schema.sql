-- BestGrassFedCattle — Supabase / PostgreSQL Database Schema
-- Production Ready Schema with foreign keys, indexes, and normalized tables

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    short_description TEXT NOT NULL,
    full_description TEXT,
    main_image TEXT NOT NULL,
    additional_images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'published', -- 'published', 'draft'
    is_featured BOOLEAN DEFAULT FALSE,
    cut_options JSONB DEFAULT '[]'::jsonb, -- e.g. ["1.0 inch", "1.5 inch", "2.0 inch", "Boneless", "Bone-in"]
    specifications JSONB DEFAULT '{}'::jsonb, -- e.g. {"Aging": "21 Days Dry Aged", "Diet": "100% Grass-Fed & Finished"}
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- 4. Order Requests Table (Core B2C Order Request System)
CREATE TABLE IF NOT EXISTS order_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no VARCHAR(50) UNIQUE NOT NULL, -- Format: BGC-XXXXX
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    contact_preference VARCHAR(50) DEFAULT 'email', -- 'email', 'phone', 'whatsapp', 'telegram'
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cut_preference VARCHAR(150),
    special_instructions TEXT,
    additional_notes TEXT,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'reviewing', 'contacted', 'confirmed', 'completed', 'cancelled'
    admin_notes TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_requests_status ON order_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_requests_created_at ON order_requests(created_at DESC);

-- 5. Wholesale Requests Table (B2B Bulk Request System)
CREATE TABLE IF NOT EXISTS wholesale_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no VARCHAR(50) UNIQUE NOT NULL, -- Format: BGC-WXXXXX
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- 'restaurant', 'hotel', 'caterer', 'retailer', 'butcher', 'other'
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    products_interested TEXT NOT NULL,
    estimated_quantity VARCHAR(150) NOT NULL,
    preferred_cuts TEXT,
    purchase_frequency VARCHAR(100), -- 'one-time', 'weekly', 'bi-weekly', 'monthly', 'quarterly'
    additional_requirements TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'reviewing', 'contacted', 'confirmed', 'completed', 'cancelled'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wholesale_requests_status ON wholesale_requests(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_requests_created_at ON wholesale_requests(created_at DESC);

-- 6. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'replied', 'archived'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);

-- 7. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_role VARCHAR(255),
    quote TEXT NOT NULL,
    photo_url TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Farm', -- 'cattle', 'grassland', 'beef', 'farm', 'behind_scenes'
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    tags TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Site Settings (Single Row Store)
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    business_name VARCHAR(255) DEFAULT 'BestGrassFedCattle',
    tagline VARCHAR(255) DEFAULT 'Premium Grass-Fed Beef, Raised With Purpose.',
    location VARCHAR(255) DEFAULT 'New York, United States',
    currency VARCHAR(10) DEFAULT 'USD ($)',
    contact_email VARCHAR(255) DEFAULT 'info@bestgrassfedcattle.com',
    contact_phone VARCHAR(50) DEFAULT '+1 (800) 555-BEEF',
    address TEXT DEFAULT 'Upstate Pastures, New York, United States',
    social_links JSONB DEFAULT '{"instagram": "", "facebook": "", "twitter": ""}'::jsonb,
    brand_description TEXT DEFAULT 'Ethically raised 100% grass-fed and grass-finished cattle from pristine New York pastures.',
    logo_url TEXT,
    favicon_url TEXT,
    theme_default VARCHAR(20) DEFAULT 'system',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CMS Content (Key-Value/Page Section Store)
CREATE TABLE IF NOT EXISTS cms_content (
    id VARCHAR(100) PRIMARY KEY,
    page_key VARCHAR(100) NOT NULL,
    section_key VARCHAR(100) NOT NULL,
    content_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Notification Settings (Single Row Store)
CREATE TABLE IF NOT EXISTS notification_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    admin_dashboard_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    email_recipient VARCHAR(255) DEFAULT 'orders@bestgrassfedcattle.com',
    smtp_host VARCHAR(255),
    smtp_port INT DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    smtp_secure BOOLEAN DEFAULT FALSE,
    telegram_enabled BOOLEAN DEFAULT FALSE,
    telegram_bot_token TEXT,
    telegram_chat_id VARCHAR(100),
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_phone_id VARCHAR(100),
    whatsapp_access_token TEXT,
    whatsapp_recipient_phone VARCHAR(50),
    livechat_enabled BOOLEAN DEFAULT FALSE,
    livechat_webhook_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'order_request', -- 'order_request', 'wholesale_request', 'contact'
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notification Logs Table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    reference_no VARCHAR(100),
    channel VARCHAR(50) NOT NULL, -- 'dashboard', 'email', 'telegram', 'whatsapp', 'livechat'
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'skipped'
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
