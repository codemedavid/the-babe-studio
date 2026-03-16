-- ============================================
-- PEPTIDE PULSE - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- Created: 2025-12-23
-- ============================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

-- Seed Categories
INSERT INTO public.categories (id, name, sort_order, icon, active) VALUES
('c0a80121-0001-4e78-94f8-585d77059001', 'Peptides', 1, 'FlaskConical', true),
('c0a80121-0002-4e78-94f8-585d77059002', 'Weight Management', 2, 'Scale', true),
('c0a80121-0003-4e78-94f8-585d77059003', 'Beauty & Anti-Aging', 3, 'Sparkles', true),
('c0a80121-0004-4e78-94f8-585d77059004', 'Wellness & Vitality', 4, 'Heart', true),
('c0a80121-0005-4e78-94f8-585d77059005', 'GLP-1 Agonists', 5, 'Pill', true),
('c0a80121-0006-4e78-94f8-585d77059006', 'Insulin Pens', 6, 'Syringe', true),
('c0a80121-0007-4e78-94f8-585d77059007', 'Accessories', 7, 'Package', true),
('c0a80121-0008-4e78-94f8-585d77059008', 'Bundles & Kits', 8, 'Gift', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    active = EXCLUDED.active,
    updated_at = NOW();

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Uncategorized',
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(10, 2),
    discount_start_date TIMESTAMP WITH TIME ZONE,
    discount_end_date TIMESTAMP WITH TIME ZONE,
    discount_active BOOLEAN DEFAULT false,
    purity_percentage DECIMAL(5, 2) DEFAULT 99.0,
    molecular_weight TEXT,
    cas_number TEXT,
    sequence TEXT,
    storage_conditions TEXT DEFAULT 'Store at -20°C',
    inclusions TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    safety_sheet_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;

-- ============================================
-- 3. PRODUCT VARIATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity_mg DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(10, 2),
    discount_active BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.product_variations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.product_variations TO anon, authenticated, service_role;

-- ============================================
-- 4. SITE SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;

-- Updated_at trigger for site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Site Settings
INSERT INTO public.site_settings (id, value, type, description) VALUES
('site_name', 'Peptide Pulse', 'text', 'The name of the website'),
('site_logo', '/assets/logo.jpeg', 'image', 'The logo image URL for the site'),
('site_description', 'Premium Peptide Solutions', 'text', 'Short description of the site'),
('currency', '₱', 'text', 'Currency symbol for prices'),
('currency_code', 'PHP', 'text', 'Currency code for payments'),
('hero_badge_text', 'Premium Peptide Solutions', 'text', 'Badge text in hero section'),
('hero_title_prefix', 'Premium', 'text', 'Hero title prefix'),
('hero_title_highlight', 'Peptides', 'text', 'Hero title highlighted word'),
('hero_title_suffix', '& Essentials', 'text', 'Hero title suffix'),
('hero_subtext', 'From the Lab to You — Simplifying Science, One Dose at a Time.', 'text', 'Hero subtext'),
('hero_tagline', 'Quality-tested products. Reliable performance. Trusted by our community.', 'text', 'Hero tagline'),
('hero_description', 'Peptide Pulse is your all-in-one destination for high-quality peptides, peptide pens, and the essential accessories you need for a smooth and confident wellness routine.', 'text', 'Hero description'),
('hero_accent_color', 'gold-500', 'text', 'Hero accent color'),
('coa_page_enabled', 'true', 'boolean', 'Enable/disable the COA page')
ON CONFLICT (id) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- ============================================
-- 5. PAYMENT METHODS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    account_number TEXT,
    account_name TEXT,
    qr_code_url TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.payment_methods TO anon, authenticated, service_role;

-- Seed Payment Methods
INSERT INTO public.payment_methods (id, name, account_number, account_name, active, sort_order) VALUES
('0a0b0001-0001-4e78-94f8-585d77059001', 'GCash', '', 'Peptide Pulse', true, 1),
('0a0b0002-0002-4e78-94f8-585d77059002', 'BDO', '', 'Peptide Pulse', true, 2),
('0a0b0003-0003-4e78-94f8-585d77059003', 'Security Bank', '', 'Peptide Pulse', true, 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. SHIPPING LOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.shipping_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shipping_locations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.shipping_locations TO anon, authenticated, service_role;

-- Seed Shipping Locations
INSERT INTO public.shipping_locations (id, name, fee, is_active, order_index) VALUES
('NCR', 'NCR (Metro Manila)', 75, true, 1),
('LUZON', 'Luzon (Outside NCR)', 100, true, 2),
('VISAYAS_MINDANAO', 'Visayas & Mindanao', 130, true, 3)
ON CONFLICT (id) DO UPDATE SET
    fee = EXCLUDED.fee,
    name = EXCLUDED.name;

-- ============================================
-- 7. ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer Information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    contact_method TEXT DEFAULT 'phone',
    
    -- Shipping Address
    shipping_address TEXT NOT NULL,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip_code TEXT,
    shipping_country TEXT DEFAULT 'Philippines',
    shipping_barangay TEXT,
    shipping_region TEXT,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    
    -- Order Details
    order_items JSONB NOT NULL,
    subtotal DECIMAL(10, 2),
    total_price DECIMAL(10, 2) NOT NULL,
    pricing_mode TEXT DEFAULT 'PHP',
    
    -- Payment
    payment_method_id TEXT,
    payment_method_name TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_proof_url TEXT,
    
    -- Promo Codes
    promo_code_id UUID,
    promo_code TEXT,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    
    -- Order Status
    order_status TEXT DEFAULT 'new',
    notes TEXT,
    admin_notes TEXT,
    
    -- Tracking
    tracking_number TEXT,
    tracking_courier TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;

-- Updated_at trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. COA REPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.coa_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    batch TEXT,
    test_date DATE NOT NULL,
    purity_percentage DECIMAL(5,3) NOT NULL,
    quantity TEXT NOT NULL,
    task_number TEXT NOT NULL,
    verification_key TEXT NOT NULL,
    image_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    manufacturer TEXT DEFAULT 'Peptide Pulse',
    laboratory TEXT DEFAULT 'Janoshik Analytical',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coa_reports_product_name ON public.coa_reports(product_name);
CREATE INDEX IF NOT EXISTS idx_coa_reports_featured ON public.coa_reports(featured);

ALTER TABLE public.coa_reports DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.coa_reports TO anon, authenticated, service_role;

-- ============================================
-- 9. FAQs TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS faqs_order_idx ON public.faqs (order_index ASC);
CREATE INDEX IF NOT EXISTS faqs_category_idx ON public.faqs (category);
CREATE INDEX IF NOT EXISTS faqs_active_idx ON public.faqs (is_active);

ALTER TABLE public.faqs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.faqs TO anon, authenticated, service_role;

-- Seed FAQs
INSERT INTO public.faqs (question, answer, category, order_index, is_active) VALUES
('Can I use Tirzepatide?', 'Before purchasing, please check if Tirzepatide is suitable for you. Contact us for more details.', 'PRODUCT & USAGE', 1, true),
('Do you reconstitute (recon) Tirzepatide?', 'Yes — for Metro Manila orders only. We provide free reconstitution when you purchase the complete set.', 'PRODUCT & USAGE', 2, true),
('How should peptides be stored?', 'Peptides must be stored in the refrigerator, especially once reconstituted.', 'PRODUCT & USAGE', 3, true),
('What payment options do you accept?', 'We accept GCash, Security Bank, and BDO. COD is not accepted, except for Lalamove.', 'PAYMENT METHODS', 4, true),
('Where are you located?', '📍 General Trias, Cavite', 'SHIPPING & DELIVERY', 5, true),
('How long is shipping?', '📦 J&T Express: Usually 2–3 days (Transit time may vary by location)', 'SHIPPING & DELIVERY', 6, true),
('Do you ship nationwide?', 'Yes — J&T Express (nationwide) and Lalamove (Metro Manila & nearby areas)', 'SHIPPING & DELIVERY', 7, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. PROMO CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(active);

ALTER TABLE public.promo_codes DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.promo_codes TO anon, authenticated, service_role;

-- ============================================
-- 11. GUIDE TOPICS / PEPTALK TABLE (DISABLED)
-- ============================================
-- Peptalk functionality has been removed from the website.
-- Uncomment the following if you want to re-enable it:

-- CREATE TABLE IF NOT EXISTS public.guide_topics (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     title TEXT NOT NULL,
--     preview TEXT,
--     content TEXT NOT NULL,
--     cover_image TEXT,
--     author TEXT DEFAULT 'Peptide Pulse Team',
--     published_date TEXT DEFAULT CURRENT_DATE::TEXT,
--     display_order INTEGER NOT NULL DEFAULT 0,
--     is_enabled BOOLEAN DEFAULT true,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

-- CREATE INDEX IF NOT EXISTS idx_guide_topics_display_order ON public.guide_topics(display_order);
-- CREATE INDEX IF NOT EXISTS idx_guide_topics_enabled ON public.guide_topics(is_enabled);

-- ALTER TABLE public.guide_topics DISABLE ROW LEVEL SECURITY;
-- GRANT ALL ON TABLE public.guide_topics TO anon, authenticated, service_role;

-- ============================================
-- 12. TIRZEPATIDE PRODUCTS
-- ============================================

INSERT INTO public.products (id, name, description, base_price, category, image_url, featured, available, stock_quantity, purity_percentage, molecular_weight, cas_number, storage_conditions, inclusions) VALUES
-- Tirzepatide 5mg
('a1a20001-0001-4e78-94f8-585d77059001', 
 'Tirzepatide 5mg', 
 'Tirzepatide is a novel GIP and GLP-1 receptor agonist. This dual-action peptide has shown remarkable efficacy in clinical trials for weight management and metabolic health. Laboratory tested for 99%+ purity.',
 1800.00, 
 'c0a80121-0002-4e78-94f8-585d77059002',
 NULL, 
 true, 
 true, 
 50,
 99.5,
 '4813.45 g/mol',
 '2023788-19-2',
 'Store at -20°C. Protect from light.',
 ARRAY['1x 5mg Tirzepatide Vial', 'Certificate of Analysis', 'Storage Guidelines']
),

-- Tirzepatide 10mg
('a1a20002-0002-4e78-94f8-585d77059002', 
 'Tirzepatide 10mg', 
 'Double-strength Tirzepatide formulation. GIP/GLP-1 dual receptor agonist for enhanced metabolic support. Ideal for progressive protocols. Lab tested 99%+ purity.',
 3200.00, 
 'c0a80121-0002-4e78-94f8-585d77059002',
 NULL, 
 true, 
 true, 
 50,
 99.5,
 '4813.45 g/mol',
 '2023788-19-2',
 'Store at -20°C. Protect from light.',
 ARRAY['1x 10mg Tirzepatide Vial', 'Certificate of Analysis', 'Storage Guidelines']
),

-- Tirzepatide 15mg
('a1a20003-0003-4e78-94f8-585d77059003', 
 'Tirzepatide 15mg', 
 'High-potency Tirzepatide formulation for advanced users. Premium GIP/GLP-1 dual agonist. Maximum strength for optimal results. Lab tested 99%+ purity.',
 4500.00, 
 'c0a80121-0002-4e78-94f8-585d77059002',
 NULL, 
 true, 
 true, 
 50,
 99.5,
 '4813.45 g/mol',
 '2023788-19-2',
 'Store at -20°C. Protect from light.',
 ARRAY['1x 15mg Tirzepatide Vial', 'Certificate of Analysis', 'Storage Guidelines']
),

-- Tirzepatide 30mg
('a1a20004-0004-4e78-94f8-585d77059004', 
 'Tirzepatide 30mg', 
 'Premium maximum-strength Tirzepatide. Our highest concentration formulation for experienced users. Exceptional value for extended protocols. Lab tested 99%+ purity.',
 7500.00, 
 'c0a80121-0002-4e78-94f8-585d77059002',
 NULL, 
 true, 
 true, 
 30,
 99.5,
 '4813.45 g/mol',
 '2023788-19-2',
 'Store at -20°C. Protect from light.',
 ARRAY['1x 30mg Tirzepatide Vial', 'Certificate of Analysis', 'Storage Guidelines', 'Reconstitution Water']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    category = EXCLUDED.category,
    featured = EXCLUDED.featured,
    available = EXCLUDED.available,
    stock_quantity = EXCLUDED.stock_quantity,
    purity_percentage = EXCLUDED.purity_percentage,
    molecular_weight = EXCLUDED.molecular_weight,
    cas_number = EXCLUDED.cas_number,
    storage_conditions = EXCLUDED.storage_conditions,
    inclusions = EXCLUDED.inclusions,
    updated_at = NOW();

-- ============================================
-- 13. PRODUCT VARIATIONS FOR TIRZEPATIDE
-- ============================================

INSERT INTO public.product_variations (product_id, name, price, stock_quantity) VALUES
('a1a20001-0001-4e78-94f8-585d77059001', 'Vials Only', 1800.00, 50),
('a1a20001-0001-4e78-94f8-585d77059001', 'Complete Set', 2300.00, 30),
('a1a20002-0002-4e78-94f8-585d77059002', 'Vials Only', 3200.00, 50),
('a1a20002-0002-4e78-94f8-585d77059002', 'Complete Set', 3700.00, 30),
('a1a20003-0003-4e78-94f8-585d77059003', 'Vials Only', 4500.00, 50),
('a1a20003-0003-4e78-94f8-585d77059003', 'Complete Set', 5000.00, 30),
('a1a20004-0004-4e78-94f8-585d77059004', 'Vials Only', 7500.00, 30),
('a1a20004-0004-4e78-94f8-585d77059004', 'Complete Set', 8200.00, 20)
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. STORAGE BUCKETS (Run separately if needed)
-- ============================================
-- Note: Storage bucket creation requires different SQL
-- Run these in Supabase Dashboard > Storage > New Bucket:
-- - payment-proofs (public)
-- - product-images (public)
-- - article-covers (public)

-- ============================================
-- 15. VERIFY ALL TABLES
-- ============================================

SELECT 'categories' as table_name, COUNT(*) as row_count FROM public.categories
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'product_variations', COUNT(*) FROM public.product_variations
UNION ALL
SELECT 'site_settings', COUNT(*) FROM public.site_settings
UNION ALL
SELECT 'payment_methods', COUNT(*) FROM public.payment_methods
UNION ALL
SELECT 'shipping_locations', COUNT(*) FROM public.shipping_locations
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'coa_reports', COUNT(*) FROM public.coa_reports
UNION ALL
SELECT 'faqs', COUNT(*) FROM public.faqs
UNION ALL
SELECT 'promo_codes', COUNT(*) FROM public.promo_codes;
-- Note: guide_topics table is disabled (Peptalk removed)
