// Protocol Templates Library
// Pre-written protocol templates for each peptide category

export interface ProtocolTemplate {
    dosage: string;
    frequency: string;
    duration: string;
    notes: string[];
    storage: string;
}

// Templates mapped by category
export const protocolTemplates: Record<string, ProtocolTemplate> = {
    'Weight Management': {
        dosage: '2.5mg - 15mg weekly (start low, titrate up)',
        frequency: 'Once weekly on the same day',
        duration: '12-16 weeks per cycle',
        notes: [
            'Start with lowest dose for first 4 weeks',
            'Increase gradually every 4 weeks as tolerated',
            'Inject subcutaneously in abdomen, thigh, or upper arm',
            'Take with or without food',
            'May cause nausea initially - eat smaller meals',
            'Rotate injection sites to prevent lipodystrophy'
        ],
        storage: 'Refrigerate at 2-8°C. Once in use, can be kept at room temperature for up to 21 days.'
    },

    'Beauty & Anti-Aging': {
        dosage: '1mg - 3mg daily',
        frequency: 'Once daily',
        duration: '8-12 weeks per cycle',
        notes: [
            'Can be used topically or via injection',
            'Promotes collagen synthesis',
            'Supports skin elasticity and wound healing',
            'Safe for long-term use',
            'Best results seen after 4-6 weeks',
            'Can combine with other skincare actives'
        ],
        storage: 'Refrigerate after reconstitution. Use within 30 days.'
    },

    'Healing & Regeneration': {
        dosage: '250mcg - 500mcg daily',
        frequency: 'Once or twice daily',
        duration: '4-8 weeks per cycle',
        notes: [
            'Can be injected near injury site for localized effect',
            'Also effective systemically',
            'Split dose morning and evening for best results',
            'No known side effects at therapeutic doses',
            'Stacks well with other healing peptides',
            'Take on empty stomach'
        ],
        storage: 'Refrigerate after reconstitution. Use within 30 days.'
    },

    'Longevity & Anti-Aging': {
        dosage: '5mg - 10mg daily',
        frequency: 'Once daily, preferably before bed',
        duration: '10-20 days per cycle, 4-6 months between cycles',
        notes: [
            'Short intense cycles recommended',
            'Promotes cellular regeneration',
            'Supports natural hormone production',
            'Best used 2-3 times per year',
            'Subcutaneous injection preferred',
            'No significant side effects reported'
        ],
        storage: 'Refrigerate. Stable for 6 months when stored properly.'
    },

    'Cognitive Enhancement': {
        dosage: '250mcg - 600mcg daily',
        frequency: '1-2 times daily',
        duration: '2-4 weeks per cycle',
        notes: [
            'Intranasal or subcutaneous administration',
            'Nootropic and mood-enhancing effects',
            'Works within 15-30 minutes',
            'Split dose: morning and early afternoon',
            'Avoid late doses to prevent sleep issues',
            'Take breaks between cycles'
        ],
        storage: 'Refrigerate. Protect from light. Use within 30 days.'
    },

    'Sleep & Recovery': {
        dosage: '100mcg - 300mcg before bed',
        frequency: 'Once daily, 30 min before sleep',
        duration: '2-4 weeks per cycle',
        notes: [
            'Promotes deep, restorative sleep',
            'Do not combine with other sedatives',
            'Effects build over several days',
            'Take 2-4 week breaks between cycles',
            'Subcutaneous injection preferred',
            'Avoid alcohol when using'
        ],
        storage: 'Refrigerate after reconstitution.'
    },

    'Growth Hormone': {
        dosage: '1mg - 2mg daily',
        frequency: 'Once daily before bed on empty stomach',
        duration: '12-26 weeks per cycle',
        notes: [
            'Stimulates natural GH release',
            'Inject subcutaneously in abdomen',
            'No food 2 hours before/after',
            'Best administered before bed',
            'Monitor IGF-1 levels periodically',
            'Results visible after 8-12 weeks'
        ],
        storage: 'Refrigerate at 2-8°C.'
    },

    'Metabolic Health': {
        dosage: '5mg - 10mg weekly',
        frequency: 'Once weekly or divided into 2-3 doses',
        duration: '8-12 weeks per cycle',
        notes: [
            'Improves insulin sensitivity',
            'Enhances exercise capacity',
            'Best taken before exercise',
            'Can be injected IM or subcutaneously',
            'Supports metabolic health',
            'Monitor blood glucose if diabetic'
        ],
        storage: 'Refrigerate after reconstitution.'
    },

    'Mitochondrial Health': {
        dosage: '10mg - 40mg daily',
        frequency: 'Once daily',
        duration: '4-8 weeks per cycle',
        notes: [
            'Targets mitochondrial function',
            'Protects against oxidative stress',
            'Supports cellular energy production',
            'Inject subcutaneously',
            'Best taken in morning',
            'Take 4-week breaks between cycles'
        ],
        storage: 'Refrigerate. Protect from light.'
    },

    'Anti-Inflammatory': {
        dosage: '100mcg - 400mcg daily',
        frequency: 'Once or twice daily',
        duration: '4-8 weeks per cycle',
        notes: [
            'Potent anti-inflammatory peptide',
            'Supports gut health and skin conditions',
            'Subcutaneous injection',
            'No significant side effects',
            'Works systemically',
            'Safe for extended use'
        ],
        storage: 'Refrigerate after reconstitution.'
    },

    'Sexual Wellness': {
        dosage: '500mcg - 2mg as needed',
        frequency: 'As needed, 1-2 hours before activity',
        duration: 'Use as needed with 24hr minimum between doses',
        notes: [
            'Start with low dose to assess tolerance',
            'Effects can last 24-72 hours',
            'Inject subcutaneously 45min-2hrs before',
            'May cause nausea - antiemetic can help',
            'Maximum once per 24 hours',
            'Stay hydrated'
        ],
        storage: 'Refrigerate. Use within 30 days of reconstitution.'
    },

    'Detox & Skin Brightening': {
        dosage: '200mg - 500mg every other day',
        frequency: '3-4 times weekly',
        duration: '8-12 weeks per cycle',
        notes: [
            'Master antioxidant for detoxification',
            'Skin brightening and evening tone',
            'Can inject subcutaneously or IM',
            'Often combined with Vitamin C',
            'Supports liver function',
            'Results visible after 4-6 weeks'
        ],
        storage: 'Refrigerate. Protect from light and heat.'
    },

    'Fat Burning & Energy': {
        dosage: '1ml injection',
        frequency: '2-3 times weekly',
        duration: 'Ongoing or 8-12 week cycles',
        notes: [
            'Lipotropic injection for fat metabolism',
            'Boosts energy and metabolism',
            'Inject intramuscularly in thigh or buttock',
            'Best combined with exercise program',
            'Supports liver fat processing',
            'B12 provides energy boost'
        ],
        storage: 'Refrigerate. Protect from light.'
    },

    'Fat Dissolving': {
        dosage: 'Apply as directed to treatment area',
        frequency: 'Weekly treatments',
        duration: '4-6 sessions typically',
        notes: [
            'Lipolytic solution for fat reduction',
            'Professional application recommended',
            'Targets stubborn fat deposits',
            'Massage after application',
            'Results visible after 2-3 sessions',
            'Avoid strenuous exercise 24hrs after'
        ],
        storage: 'Refrigerate. Keep away from direct sunlight.'
    },

    'Healing & Anti-Inflammatory': {
        dosage: 'Follow component ratios as pre-mixed',
        frequency: 'Once daily',
        duration: '6-8 weeks per cycle',
        notes: [
            'Combination stack for enhanced healing',
            'Multiple peptides work synergistically',
            'Subcutaneous injection',
            'All-in-one healing protocol',
            'Monitor for any reactions',
            'Allow rest periods between cycles'
        ],
        storage: 'Refrigerate after reconstitution.'
    },

    'Tanning & Aesthetics': {
        dosage: '100mcg - 500mcg loading, then maintenance',
        frequency: 'Daily during loading, then as needed',
        duration: 'Loading: 10-14 days, Maintenance: ongoing',
        notes: [
            'Start with 100mcg to assess tolerance',
            'UV exposure required for melanin activation',
            'May cause nausea initially - take before bed',
            'Moles may darken - monitor for changes',
            'Stay hydrated',
            'Use sunscreen to prevent burns'
        ],
        storage: 'Refrigerate after reconstitution. Use within 30 days.'
    },

};

// Function to get protocol template for a category (null if not found — no placeholder fallback)
export const getProtocolTemplate = (category: string): ProtocolTemplate | null => {
    return protocolTemplates[category] || null;
};

// Returns null when we have no real template for this category, so callers can skip creating placeholder rows.
export const generateProtocolFromTemplate = (productName: string, category: string) => {
    const template = getProtocolTemplate(category);
    if (!template) return null;

    return {
        name: `${productName} Protocol`,
        category: category,
        dosage: template.dosage,
        frequency: template.frequency,
        duration: template.duration,
        notes: template.notes,
        storage: template.storage,
        sort_order: 0,
        active: true
    };
};
