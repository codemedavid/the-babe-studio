export interface AssessmentFormData {
  // Step 1
  consent_agreed: boolean;
  // Step 2
  emotional_motivators: string[];
  // Step 3
  goals: string[];
  // Step 4
  height_cm: string;
  weight_kg: string;
  waist_inches: string;
  hip_inches: string;
  // Step 5
  date_of_birth: string;
  sex_assigned: string;
  location: string;
  // Step 6
  pregnancy_status: string[];
  // Step 7
  medical_conditions: string[];
  // Step 8
  family_history_conditions: string[];
  // Step 9
  current_medications: string;
  previous_surgeries: boolean | null;
  previous_surgeries_details: string;
  drug_allergies: boolean | null;
  drug_allergies_details: string;
  // Step 10
  experience_level: string;
  peptide_experience_first_time: boolean | null;
  current_prescription_glp1: boolean | null;
  smoking_status: string;
  // Step 11
  preferences: {
    budget: string;
    frequency: string;
  };
  // Step 12
  full_name: string;
  email: string;
  phone: string;
  final_consent: boolean;
}

export interface GoalRecommendation {
  product: string;
  reason: string;
  priority: 'primary' | 'supporting';
}

export interface MatchedRecommendation extends GoalRecommendation {
  goalKey: string;
  goalLabel: string;
  matchedProduct?: {
    id: string;
    name: string;
    image_url: string | null;
    base_price: number;
    purity_percentage: number | null;
  };
}

export interface AssessmentResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age_range: string;
  date_of_birth: string | null;
  sex_assigned: string | null;
  location: string;
  height_cm: number | null;
  weight_kg: number | null;
  waist_inches: number | null;
  hip_inches: number | null;
  goals: string[];
  emotional_motivators: string[] | null;
  experience_level: string;
  medical_conditions: string[] | null;
  family_history_conditions: string[] | null;
  current_medications: string | null;
  previous_surgeries: boolean | null;
  previous_surgeries_details: string | null;
  drug_allergies: boolean | null;
  drug_allergies_details: string | null;
  smoking_status: string | null;
  pregnancy_status: string[] | null;
  preferences: Record<string, string> | null;
  consent_agreed: boolean;
  recommendation_generated: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

export const INITIAL_FORM_DATA: AssessmentFormData = {
  consent_agreed: false,
  emotional_motivators: [],
  goals: [],
  height_cm: '',
  weight_kg: '',
  waist_inches: '',
  hip_inches: '',
  date_of_birth: '',
  sex_assigned: '',
  location: '',
  pregnancy_status: [],
  medical_conditions: [],
  family_history_conditions: [],
  current_medications: '',
  previous_surgeries: null,
  previous_surgeries_details: '',
  drug_allergies: null,
  drug_allergies_details: '',
  experience_level: '',
  peptide_experience_first_time: null,
  current_prescription_glp1: null,
  smoking_status: '',
  preferences: { budget: '', frequency: '' },
  full_name: '',
  email: '',
  phone: '',
  final_consent: false,
};
