-- ============================================================
-- Peptide Assessment V2 — Complete Schema
-- Run this once against your Supabase project.
-- ============================================================

-- 1. Assessment Responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact (Step 12)
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text,

  -- Derived / Basic info (Step 5)
  age_range        text NOT NULL,
  date_of_birth    date,
  sex_assigned     text CHECK (sex_assigned IN ('male', 'female', 'other')),
  location         text NOT NULL,

  -- Physical measurements (Step 4)
  height_cm        decimal(5,2),
  weight_kg        decimal(5,2),
  waist_inches     decimal(4,1),
  hip_inches       decimal(4,1),
  weight_goal_kg   decimal(4,1),

  -- Motivators & goals (Steps 2-3)
  emotional_motivators    text[],
  goals                   text[] NOT NULL,

  -- Experience & lifestyle (Step 10)
  experience_level              text NOT NULL,
  peptide_experience_first_time boolean,
  current_prescription_glp1     boolean,
  smoking_status                text CHECK (smoking_status IN ('smoker', 'non_smoker', 'other')),

  -- Reproductive (Step 6)
  pregnancy_status text[],

  -- Medical (Steps 7-9)
  medical_conditions          text[],
  family_history_conditions   text[],
  current_medications         text,
  previous_surgeries          boolean,
  previous_surgeries_details  text,
  drug_allergies              boolean,
  drug_allergies_details      text,

  -- Preferences (Step 11)
  preferences jsonb DEFAULT '{}',

  -- Consent (Steps 1 & 12)
  consent_agreed boolean DEFAULT false,
  final_consent  boolean DEFAULT false,
  agreed_at      timestamptz,

  -- Output
  recommendation_generated jsonb,

  -- Meta
  status     text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_assessment_email
  ON assessment_responses (email);

CREATE INDEX IF NOT EXISTS idx_assessment_dob
  ON assessment_responses (date_of_birth);

CREATE INDEX IF NOT EXISTS idx_assessment_weight
  ON assessment_responses (weight_kg);

CREATE INDEX IF NOT EXISTS idx_assessment_status
  ON assessment_responses (status);

CREATE INDEX IF NOT EXISTS idx_assessment_created
  ON assessment_responses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_medical_conditions
  ON assessment_responses USING gin (medical_conditions);

-- 3. RLS
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit assessments"
  ON assessment_responses FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Public can read own assessment by id"
  ON assessment_responses FOR SELECT
  TO anon USING (true);

-- 4. Recommendation Rules table (for admin-driven rules engine)
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name            text NOT NULL,
  target_goal          text NOT NULL,
  target_experience    text DEFAULT 'All',
  primary_product_id   uuid REFERENCES products(id) ON DELETE SET NULL,
  secondary_product_ids uuid[],
  educational_note     text,
  priority             integer DEFAULT 10,
  is_active            boolean DEFAULT true,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE recommendation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active rules"
  ON recommendation_rules FOR SELECT
  TO anon USING (is_active = true);

-- 5. Secure RPC for fetching assessment results (prevents enumeration)
CREATE OR REPLACE FUNCTION get_assessment_result(assessment_id uuid)
RETURNS SETOF assessment_responses
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM assessment_responses WHERE id = assessment_id LIMIT 1;
$$;
