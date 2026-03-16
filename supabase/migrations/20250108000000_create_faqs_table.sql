-- Create FAQs table for HP GLOW
-- Run this in your Supabase SQL Editor

-- Create the faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'PRODUCT & USAGE',
  order_index integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.faqs
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to manage FAQs
CREATE POLICY "Allow authenticated insert" ON public.faqs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.faqs
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON public.faqs
  FOR DELETE USING (true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS faqs_order_idx ON public.faqs (order_index ASC);
CREATE INDEX IF NOT EXISTS faqs_category_idx ON public.faqs (category);
CREATE INDEX IF NOT EXISTS faqs_active_idx ON public.faqs (is_active);

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, category, order_index, is_active) VALUES
-- Product & Usage
('Can I use Tirzepatide?', 'Before purchasing, please check if Tirzepatide is suitable for you.
✔️ View the checklist here — Contact us for more details.', 'PRODUCT & USAGE', 1, true),

('Do you reconstitute (recon) Tirzepatide?', 'Yes — for Metro Manila orders only.
I provide free reconstitution when you purchase the complete set.
I use pharma-grade bacteriostatic water, and I ship it with an ice pack + insulated pouch to maintain stability.', 'PRODUCT & USAGE', 2, true),

('What size needles and cartridges do you offer?', '• Needles: Compatible with all insulin-style pens (standard pen needle sizes).
• Cartridges: Standard 3mL capacity.', 'PRODUCT & USAGE', 3, true),

('Can the pen pusher be retracted?', '• Reusable pens: Yes, the pusher can be retracted.
• Disposable pens: The pusher cannot be retracted and will stay forward once pushed.', 'PRODUCT & USAGE', 4, true),

('How should peptides be stored?', 'Peptides must be stored in the refrigerator, especially once reconstituted.', 'PRODUCT & USAGE', 5, true),

-- Ordering & Packaging
('What''s included in my order?', 'Depending on your chosen items:
• 3mL cartridge
• Pen needles
• Optional: alcohol swabs
• Free Tirzepatide reconstitution for Metro Manila set orders', 'ORDERING & PACKAGING', 6, true),

('Do you offer bundles or discounts?', 'Yes — I offer curated bundles and custom sets.
Message me for personalized bundle options.', 'ORDERING & PACKAGING', 7, true),

('Can I return items?', '• Pens: Returnable within 1 week if defective.
• Needles and syringes: Not returnable for hygiene and safety.', 'ORDERING & PACKAGING', 8, true),

-- Payment Methods
('What payment options do you accept?', '• GCash
• Security Bank
• BDO

❌ COD is not accepted, except for Lalamove
→ You can pay the rider directly or have the rider pay upfront on your behalf.', 'PAYMENT METHODS', 9, true),

-- Shipping & Delivery
('Where are you located?', '📍 General Trias, Cavite', 'SHIPPING & DELIVERY', 10, true),

('How long is shipping?', '📦 J&T Express: Usually 2–3 days
(Transit time may vary by location and sorting)', 'SHIPPING & DELIVERY', 11, true),

('When do orders ship out?', 'Orders placed before 11:00 AM ship out on the next J&T schedule (Tuesday & Thursday)
→ Subject to order volume.', 'SHIPPING & DELIVERY', 12, true),

('Do you ship nationwide?', 'Yes —
• J&T Express (nationwide)
• Lalamove (Metro Manila & nearby areas)', 'SHIPPING & DELIVERY', 13, true);

-- Grant permissions
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO authenticated;
