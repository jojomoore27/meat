-- ==============================================================================
-- BestGrassFedCattle — Supabase Production RLS & Access Policies
-- Run this in your Supabase Dashboard > SQL Editor (Takes 10 Seconds)
--
-- This script configures Row Level Security (RLS) policies across all tables,
-- allowing your frontend visitors to view catalog cuts/gallery photos and
-- allowing your backend (via service role, anon, or postgres pool) to create,
-- update, and permanently delete records without policy violations.
-- ==============================================================================

-- 1. Create failed_media_cleanups table if not exists
CREATE TABLE IF NOT EXISTS failed_media_cleanups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_url TEXT NOT NULL,
    storage_key TEXT,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Row Level Security on all application tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_media_cleanups ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid naming conflicts
DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOR tbl, pol IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', pol, tbl);
    END LOOP;
END $$;

-- 4. Public Read Access (Visitors & Customers)
CREATE POLICY "Public Read Gallery" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read FAQs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read CMS Content" ON cms_content FOR SELECT USING (true);

-- 5. Customer Submissions (Public INSERT)
CREATE POLICY "Public Submit Orders" ON order_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Submit Wholesale" ON wholesale_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Submit Contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- 6. Backend Full Management Policies (All CRUD operations)
-- Allows backend API handlers to read, insert, update, and permanently delete records
CREATE POLICY "Backend Manage Gallery" ON gallery_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage FAQs" ON faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Testimonials" ON testimonials FOR ALL USING (true);
CREATE POLICY "Backend Manage Media" ON media_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Site Settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage CMS Content" ON cms_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Orders" ON order_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Wholesale" ON wholesale_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Contact" ON contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Notification Settings" ON notification_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Admin Notifications" ON admin_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Notification Logs" ON notification_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Backend Manage Cleanup Queue" ON failed_media_cleanups FOR ALL USING (true) WITH CHECK (true);

-- 7. Grant Permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
