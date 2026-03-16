-- Create the FAQs table if it doesn't exist
create table if not exists public.faqs (
  id uuid not null default gen_random_uuid (),
  question text not null,
  answer text not null,
  category text not null,
  order_index integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint faqs_pkey primary key (id)
) tablespace pg_default;

-- Enable Row Level Security (RLS) if not already enabled
alter table public.faqs enable row level security;

-- Drop existing policies to ensure clean state (avoids "policy already exists" errors)
drop policy if exists "Enable read access for all users" on public.faqs;
drop policy if exists "Enable write access for all users" on public.faqs;

-- Re-create Policy for Public Read Access
create policy "Enable read access for all users"
on public.faqs
as permissive
for select
to public
using (true);

-- Re-create Policy for Admin Write Access
create policy "Enable write access for all users"
on public.faqs
as permissive
for all
to public
using (true)
with check (true);

-- Clear existing data to avoid duplicates (Optional: remove this line if you want to keep custom data)
-- truncate table public.faqs;

-- Insert Default FAQs (only if table is empty)
INSERT INTO public.faqs (question, answer, category, order_index, is_active)
SELECT question, answer, category, order_index, is_active
FROM (VALUES
  ('Can I use Tirzepatide?', 'Before purchasing, please check if Tirzepatide is suitable for you.\n✔️ View the checklist here — Contact us for more details.', 'PRODUCT & USAGE', 1, true),
  ('Do you reconstitute (recon) Tirzepatide?', 'Yes — for Metro Manila orders only.\nI provide free reconstitution when you purchase the complete set.\nI use pharma-grade bacteriostatic water, and I ship it with an ice pack + insulated pouch to maintain stability.', 'PRODUCT & USAGE', 2, true),
  ('What size needles and cartridges do you offer?', '• Needles: Compatible with all insulin-style pens (standard pen needle sizes).\n• Cartridges: Standard 3mL capacity.', 'PRODUCT & USAGE', 3, true),
  ('Can the pen pusher be retracted?', '• Reusable pens: Yes, the pusher can be retracted.\n• Disposable pens: The pusher cannot be retracted and will stay forward once pushed.', 'PRODUCT & USAGE', 4, true),
  ('How should peptides be stored?', 'Peptides must be stored in the refrigerator, especially once reconstituted.', 'PRODUCT & USAGE', 5, true),
  ('What''s included in my order?', 'Depending on your chosen items:\n• 3mL cartridge\n• Pen needles\n• Optional: alcohol swabs\n• Free Tirzepatide reconstitution for Metro Manila set orders', 'ORDERING & PACKAGING', 6, true),
  ('Do you offer bundles or discounts?', 'Yes — I offer curated bundles and custom sets.\nMessage me for personalized bundle options.', 'ORDERING & PACKAGING', 7, true),
  ('Can I return items?', '• Pens: Returnable within 1 week if defective.\n• Needles and syringes: Not returnable for hygiene and safety.', 'ORDERING & PACKAGING', 8, true),
  ('What payment options do you accept?', '• GCash\n• Security Bank\n• BDO\n\n❌ COD is not accepted, except for Lalamove\n→ You can pay the rider directly or have the rider pay upfront on your behalf.', 'PAYMENT METHODS', 9, true),
  ('Where are you located?', '📍 General Trias, Cavite', 'SHIPPING & DELIVERY', 10, true),
  ('How long is shipping?', '📦 J&T Express: Usually 2–3 days\n(Transit time may vary by location and sorting)', 'SHIPPING & DELIVERY', 11, true),
  ('When do orders ship out?', 'Orders placed before 11:00 AM ship out on the next J&T schedule (Tuesday & Thursday)\n→ Subject to order volume.', 'SHIPPING & DELIVERY', 12, true),
  ('Do you ship nationwide?', 'Yes —\n• J&T Express (nationwide)\n• Lalamove (Metro Manila & nearby areas)', 'SHIPPING & DELIVERY', 13, true)
) AS v(question, answer, category, order_index, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs);
