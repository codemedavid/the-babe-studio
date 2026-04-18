import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Shield, Heart, Target, Ruler,
  User, Baby, Stethoscope, Users, Pill, Activity, Settings, Send,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import posthog, { identifyUser } from '../lib/posthog';
import type { AssessmentFormData } from '../types/assessment';
import { INITIAL_FORM_DATA } from '../types/assessment';

// ─── Option constants ────────────────────────────────────────

const EMOTIONAL_OPTIONS = [
  { value: 'energy', label: 'Having more energy' },
  { value: 'confidence', label: 'Feeling more confident' },
  { value: 'health', label: 'Improving overall health' },
  { value: 'body_image', label: 'Feeling better in my body' },
  { value: 'clothes', label: 'Feeling good in clothes' },
  { value: 'longevity', label: 'Living a longer, healthier life' },
];

const GOAL_GROUPS = [
  {
    name: 'Weight Management',
    options: [
      { value: 'weight_5_10kg', label: 'Lose 5–10 kg' },
      { value: 'weight_10_20kg', label: 'Lose 10–20 kg' },
      { value: 'weight_20plus', label: 'Lose 20+ kg' },
      { value: 'weight_maintain', label: 'Maintain current weight' },
    ],
  },
  {
    name: 'Other Health Goals',
    options: [
      { value: 'energy_mild', label: 'Mild fatigue / Energy boost' },
      { value: 'energy_chronic', label: 'Chronic fatigue recovery' },
      { value: 'recovery_athletic', label: 'Athletic recovery' },
      { value: 'muscle_building', label: 'Build muscle mass' },
      { value: 'body_recomposition', label: 'Body recomposition' },
      { value: 'anti_aging', label: 'Anti-aging / Longevity' },
      { value: 'cognitive_function', label: 'Cognitive enhancement' },
      { value: 'immune_support', label: 'Immune system support' },
    ],
  },
];

const PREGNANCY_OPTIONS = [
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'planning_pregnancy', label: 'Planning to be pregnant in the next 2 months' },
  { value: 'none', label: 'None of the above' },
];

const MEDICAL_OPTIONS = [
  'Medullary Thyroid Carcinoma / Multiple Endocrine Neoplasia',
  'Thyroid Problems (goiter, Graves\' disease, hypothyroid, hyperthyroid)',
  'Thyroid Cancer',
  'Pancreatitis',
  'Gallbladder problems',
  'Gallstones',
  'Low blood sugar',
  'Kidney Problems',
  'Vision Changes (Diabetic Retinopathy)',
  'Hypersensitivity to peptides',
  'Heart Problems (abnormal rhythms, disease, attack, failure)',
  'Mental Health Problems (severe anxiety, depression, schizophrenia, personality disorders)',
  'Eating Disorder (anorexia, bulimia, binge eating)',
  'Severe Gastro-Intestinal Problems (IBD, gastroparesis)',
  'Liver Problems (hepatitis, fatty liver, alcohol liver disease)',
  'None of the above',
];

const FAMILY_OPTIONS = [
  'Thyroid cancer or disorders',
  'Heart disease',
  'Mental health issues (severe)',
  'Eating disorders',
  'Liver or kidney problems',
  'GI issues',
  'Pancreatitis',
  'Gallbladder problems',
  'Diabetic complications',
  'None of the above',
];

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'first_time', label: 'First-time (Never used peptides)' },
  { value: 'beginner', label: 'Beginner (Some experience)' },
  { value: 'experienced', label: 'Experienced (Regular user)' },
];

const SMOKING_OPTIONS = [
  { value: 'smoker', label: 'Smoker' },
  { value: 'non_smoker', label: 'Non-smoker' },
  { value: 'other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-friendly (Entry level)' },
  { value: 'mid_range', label: 'Mid-range (Quality balance)' },
  { value: 'premium', label: 'Premium (Best quality)' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily (Most convenient)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'flexible', label: 'Flexible schedule' },
];

const STEP_META = [
  { title: 'Consent & Terms', subtitle: 'Let\'s start by reviewing our terms and consent', icon: Shield },
  { title: 'Emotional Motivators', subtitle: 'What would reaching your goal mean for you?', icon: Heart },
  { title: 'Specific Goals', subtitle: 'What are your specific goals?', icon: Target },
  { title: 'Physical Measurements', subtitle: 'Help us understand your current metrics', icon: Ruler },
  { title: 'Basic Information', subtitle: 'Help us personalize your recommendations', icon: User },
  { title: 'Pregnancy / Reproductive', subtitle: 'Are you currently:', icon: Baby },
  { title: 'Medical History', subtitle: 'Do you have a medical history of the following conditions?', icon: Stethoscope },
  { title: 'Family History', subtitle: 'Do you have family history with any of the following?', icon: Users },
  { title: 'Medications / Surgeries / Allergies', subtitle: 'Please share your current medications and history', icon: Pill },
  { title: 'Lifestyle & Experience', subtitle: 'Tell us about your peptide experience and habits', icon: Activity },
  { title: 'Preferences', subtitle: 'Help us tailor our recommendations', icon: Settings },
  { title: 'Contact & Final Consent', subtitle: 'We\'ll send your personalized recommendations to this email', icon: Send },
];

const TOTAL_STEPS = 12;

// ─── Helpers ─────────────────────────────────────────────────

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeRange(dob: string): string {
  const age = calculateAge(dob);
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  return '45+';
}

// ─── Component ───────────────────────────────────────────────

const AssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AssessmentFormData>({ ...INITIAL_FORM_DATA });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Field helpers ──

  const setField = <K extends keyof AssessmentFormData>(key: K, value: AssessmentFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleArray = (field: keyof AssessmentFormData, value: string, noneValue = 'none') => {
    setForm(prev => {
      const current = (prev[field] as string[]) || [];
      // "None" clears everything else; selecting anything else clears "None"
      const noneValues = [noneValue, 'None of the above'];
      const isNone = noneValues.includes(value);

      if (isNone) {
        return { ...prev, [field]: current.includes(value) ? [] : [value] };
      }
      const withoutNone = current.filter(v => !noneValues.includes(v));
      return {
        ...prev,
        [field]: withoutNone.includes(value)
          ? withoutNone.filter(v => v !== value)
          : [...withoutNone, value],
      };
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  };

  // ── Validation ──

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!form.consent_agreed) e.consent_agreed = 'You must accept the terms to continue.';
        break;
      case 2:
        if (form.emotional_motivators.length === 0) e.emotional_motivators = 'Select at least one motivator.';
        break;
      case 3:
        if (form.goals.length === 0) e.goals = 'Select at least one goal.';
        break;
      case 4:
        if (!form.height_cm) e.height_cm = 'Height is required.';
        if (!form.weight_kg) e.weight_kg = 'Weight is required.';
        break;
      case 5:
        if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required.';
        else if (calculateAge(form.date_of_birth) < 18) e.date_of_birth = 'You must be at least 18 years old.';
        if (!form.sex_assigned) e.sex_assigned = 'Please select an option.';
        if (!form.location.trim()) e.location = 'Location is required.';
        break;
      case 10:
        if (!form.experience_level) e.experience_level = 'Please select your experience level.';
        if (!form.smoking_status) e.smoking_status = 'Please select your smoking status.';
        break;
      case 12:
        if (!form.full_name.trim()) e.full_name = 'Full name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
        if (!form.final_consent) e.final_consent = 'You must confirm to submit.';
        break;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ──

  const handleNext = () => {
    if (validate()) setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // ── Submit ──

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const ageRange = getAgeRange(form.date_of_birth);
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        age_range: ageRange,
        date_of_birth: form.date_of_birth,
        sex_assigned: form.sex_assigned,
        location: form.location.trim(),
        height_cm: parseFloat(form.height_cm) || null,
        weight_kg: parseFloat(form.weight_kg) || null,
        waist_inches: form.waist_inches ? parseFloat(form.waist_inches) : null,
        hip_inches: form.hip_inches ? parseFloat(form.hip_inches) : null,
        goals: form.goals,
        emotional_motivators: form.emotional_motivators,
        experience_level: form.experience_level,
        peptide_experience_first_time: form.peptide_experience_first_time,
        current_prescription_glp1: form.current_prescription_glp1,
        medical_conditions: form.medical_conditions,
        family_history_conditions: form.family_history_conditions,
        current_medications: form.current_medications.trim() || null,
        previous_surgeries: form.previous_surgeries,
        previous_surgeries_details: form.previous_surgeries_details.trim() || null,
        drug_allergies: form.drug_allergies,
        drug_allergies_details: form.drug_allergies_details.trim() || null,
        smoking_status: form.smoking_status,
        pregnancy_status: form.pregnancy_status,
        preferences: form.preferences,
        consent_agreed: form.consent_agreed,
        final_consent: form.final_consent,
        agreed_at: new Date().toISOString(),
        status: 'new',
      };

      const { data, error } = await supabase
        .from('assessment_responses')
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;

      identifyUser(form.email.trim(), {
        name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
        assessment_completed: true,
        assessment_date: new Date().toISOString(),
      });

      posthog.capture('tbs_assessment_completed', {
        assessment_id: data.id,
        email: form.email.trim(),
        customer_name: form.full_name.trim(),
        goals: form.goals,
        experience_level: form.experience_level,
        age_range: ageRange,
      });

      navigate(`/assessment/results?id=${data.id}`);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ──

  const CheckCard: React.FC<{ selected: boolean; label: string; onClick: () => void }> = ({ selected, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-400'
          : 'border-charcoal-200 hover:border-brand-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
          selected ? 'bg-brand-500 border-brand-500' : 'border-charcoal-300'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm font-medium text-charcoal-800">{label}</span>
      </div>
    </button>
  );

  const RadioCard: React.FC<{ selected: boolean; label: string; onClick: () => void }> = ({ selected, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-400'
          : 'border-charcoal-200 hover:border-brand-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-brand-500' : 'border-charcoal-300'
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
        </div>
        <span className="text-sm font-medium text-charcoal-800">{label}</span>
      </div>
    </button>
  );

  const FieldError: React.FC<{ field: string }> = ({ field }) =>
    errors[field] ? <p className="text-red-500 text-xs mt-1.5">{errors[field]}</p> : null;

  const stepMeta = STEP_META[step - 1];
  const StepIcon = stepMeta.icon;
  const progress = (step / TOTAL_STEPS) * 100;

  // ── Main render ──

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/20 to-white py-6 md:py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back to shop */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-charcoal-500 hover:text-brand-600 mb-6 group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </a>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs text-charcoal-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-soft border border-charcoal-100 p-6 md:p-8 mb-6">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-50 p-2 rounded-lg">
              <StepIcon className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900">
              {stepMeta.title}
            </h2>
          </div>
          <p className="text-charcoal-500 text-sm mb-6 ml-12">
            {stepMeta.subtitle}
          </p>

          {/* ────── STEP 1: Consent ────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-brand-50/40 rounded-xl p-5 border border-brand-100 text-sm text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  This assessment is for <strong>educational and informational purposes only</strong>. It is <strong>not medical advice</strong>. Always consult a licensed healthcare provider before starting any peptide protocol.
                </p>
                <p>
                  By proceeding, you agree to our{' '}
                  <a href="/terms" className="text-brand-600 underline hover:text-brand-700">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-brand-600 underline hover:text-brand-700">Privacy Policy</a>.
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 border-charcoal-200 hover:border-brand-300 transition-colors">
                <input
                  type="checkbox"
                  checked={form.consent_agreed}
                  onChange={e => setField('consent_agreed', e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-charcoal-300 text-brand-500 focus:ring-brand-400"
                />
                <span className="text-sm text-charcoal-800">
                  I accept the terms and conditions and understand that this is not medical advice.
                </span>
              </label>
              <FieldError field="consent_agreed" />
            </div>
          )}

          {/* ────── STEP 2: Emotional Motivators ────── */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EMOTIONAL_OPTIONS.map(opt => (
                  <CheckCard
                    key={opt.value}
                    label={opt.label}
                    selected={form.emotional_motivators.includes(opt.value)}
                    onClick={() => toggleArray('emotional_motivators', opt.value)}
                  />
                ))}
              </div>
              <FieldError field="emotional_motivators" />
            </div>
          )}

          {/* ────── STEP 3: Goals ────── */}
          {step === 3 && (
            <div className="space-y-6">
              {GOAL_GROUPS.map(group => (
                <div key={group.name}>
                  <h3 className="text-sm font-bold text-charcoal-700 uppercase tracking-wider mb-3">
                    {group.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.options.map(opt => (
                      <CheckCard
                        key={opt.value}
                        label={opt.label}
                        selected={form.goals.includes(opt.value)}
                        onClick={() => toggleArray('goals', opt.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <FieldError field="goals" />
            </div>
          )}

          {/* ────── STEP 4: Physical Measurements ────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    value={form.height_cm}
                    onChange={e => setField('height_cm', e.target.value)}
                    className="input-field"
                    placeholder="159"
                  />
                  <FieldError field="height_cm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={form.weight_kg}
                    onChange={e => setField('weight_kg', e.target.value)}
                    className="input-field"
                    placeholder="80"
                  />
                  <FieldError field="weight_kg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                    Waist (inches)
                  </label>
                  <input
                    type="number"
                    value={form.waist_inches}
                    onChange={e => setField('waist_inches', e.target.value)}
                    className="input-field"
                    placeholder="29"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                    Hips (inches)
                  </label>
                  <input
                    type="number"
                    value={form.hip_inches}
                    onChange={e => setField('hip_inches', e.target.value)}
                    className="input-field"
                    placeholder="38"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────── STEP 5: Basic Information ────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => setField('date_of_birth', e.target.value)}
                  className="input-field"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                <FieldError field="date_of_birth" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Sex Assigned at Birth *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SEX_OPTIONS.map(opt => (
                    <RadioCard
                      key={opt.value}
                      label={opt.label}
                      selected={form.sex_assigned === opt.value}
                      onClick={() => setField('sex_assigned', opt.value)}
                    />
                  ))}
                </div>
                <FieldError field="sex_assigned" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setField('location', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Metro Manila, Philippines"
                />
                <FieldError field="location" />
              </div>
            </div>
          )}

          {/* ────── STEP 6: Pregnancy / Reproductive ────── */}
          {step === 6 && (
            <div className="grid grid-cols-1 gap-3">
              {PREGNANCY_OPTIONS.map(opt => (
                <CheckCard
                  key={opt.value}
                  label={opt.label}
                  selected={form.pregnancy_status.includes(opt.value)}
                  onClick={() => toggleArray('pregnancy_status', opt.value)}
                />
              ))}
            </div>
          )}

          {/* ────── STEP 7: Medical History ────── */}
          {step === 7 && (
            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {MEDICAL_OPTIONS.map(label => (
                <CheckCard
                  key={label}
                  label={label}
                  selected={form.medical_conditions.includes(label)}
                  onClick={() => toggleArray('medical_conditions', label)}
                />
              ))}
            </div>
          )}

          {/* ────── STEP 8: Family History ────── */}
          {step === 8 && (
            <div className="grid grid-cols-1 gap-3">
              {FAMILY_OPTIONS.map(label => (
                <CheckCard
                  key={label}
                  label={label}
                  selected={form.family_history_conditions.includes(label)}
                  onClick={() => toggleArray('family_history_conditions', label)}
                />
              ))}
            </div>
          )}

          {/* ────── STEP 9: Medications / Surgeries / Allergies ────── */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Current Medications
                </label>
                <textarea
                  value={form.current_medications}
                  onChange={e => setField('current_medications', e.target.value)}
                  className="input-field h-24 resize-none"
                  placeholder="e.g., Metformin 500mg, twice daily&#10;Vitamin D 1000IU, once daily"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Have you had any previous surgeries?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <RadioCard label="Yes" selected={form.previous_surgeries === true} onClick={() => setField('previous_surgeries', true)} />
                  <RadioCard label="No" selected={form.previous_surgeries === false} onClick={() => setField('previous_surgeries', false)} />
                </div>
                {form.previous_surgeries && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.previous_surgeries_details}
                      onChange={e => setField('previous_surgeries_details', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Appendectomy (2018), ACL Repair (2020)"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Do you have any food or drug allergies?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <RadioCard label="Yes" selected={form.drug_allergies === true} onClick={() => setField('drug_allergies', true)} />
                  <RadioCard label="No" selected={form.drug_allergies === false} onClick={() => setField('drug_allergies', false)} />
                </div>
                {form.drug_allergies && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.drug_allergies_details}
                      onChange={e => setField('drug_allergies_details', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Penicillin, Peanuts, Shellfish"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────── STEP 10: Lifestyle & Experience ────── */}
          {step === 10 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Peptide Experience Level *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <RadioCard
                      key={opt.value}
                      label={opt.label}
                      selected={form.experience_level === opt.value}
                      onClick={() => setField('experience_level', opt.value)}
                    />
                  ))}
                </div>
                <FieldError field="experience_level" />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Is this your first time using any GLP-1 medication?
                </label>
                <p className="text-xs text-charcoal-400 mb-2">(Ozempic, Wegovy, Mounjaro, etc.)</p>
                <div className="grid grid-cols-2 gap-3">
                  <RadioCard label="Yes" selected={form.peptide_experience_first_time === true} onClick={() => setField('peptide_experience_first_time', true)} />
                  <RadioCard label="No" selected={form.peptide_experience_first_time === false} onClick={() => setField('peptide_experience_first_time', false)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Current prescription for GLP-1 medications?
                </label>
                <p className="text-xs text-charcoal-400 mb-2">Don't worry if you don't — we can help with recommendations.</p>
                <div className="grid grid-cols-2 gap-3">
                  <RadioCard label="Yes" selected={form.current_prescription_glp1 === true} onClick={() => setField('current_prescription_glp1', true)} />
                  <RadioCard label="No" selected={form.current_prescription_glp1 === false} onClick={() => setField('current_prescription_glp1', false)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Smoking Status *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SMOKING_OPTIONS.map(opt => (
                    <RadioCard
                      key={opt.value}
                      label={opt.label}
                      selected={form.smoking_status === opt.value}
                      onClick={() => setField('smoking_status', opt.value)}
                    />
                  ))}
                </div>
                <FieldError field="smoking_status" />
              </div>
            </div>
          )}

          {/* ────── STEP 11: Preferences ────── */}
          {step === 11 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Budget Range
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <RadioCard
                      key={opt.value}
                      label={opt.label}
                      selected={form.preferences.budget === opt.value}
                      onClick={() => setField('preferences', { ...form.preferences, budget: opt.value })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Preferred Dosing Frequency
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <RadioCard
                      key={opt.value}
                      label={opt.label}
                      selected={form.preferences.frequency === opt.value}
                      onClick={() => setField('preferences', { ...form.preferences, frequency: opt.value })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────── STEP 12: Contact & Final Consent ────── */}
          {step === 12 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setField('full_name', e.target.value)}
                  className="input-field"
                  placeholder="Juan Dela Cruz"
                />
                <FieldError field="full_name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className="input-field"
                  placeholder="name@example.com"
                />
                <FieldError field="email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                  className="input-field"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 border-charcoal-200 hover:border-brand-300 transition-colors">
                <input
                  type="checkbox"
                  checked={form.final_consent}
                  onChange={e => setField('final_consent', e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-charcoal-300 text-brand-500 focus:ring-brand-400"
                />
                <span className="text-sm text-charcoal-800">
                  I confirm that all information provided is accurate and I consent to receive personalized peptide recommendations based on this assessment.
                </span>
              </label>
              <FieldError field="final_consent" />

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-charcoal-200 text-charcoal-700 font-semibold text-sm hover:bg-charcoal-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Get My Recommendations
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentWizard;
