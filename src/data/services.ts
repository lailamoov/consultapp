import type { Service } from '../types';

// =============================================================================
// MOOV Health Service Catalog
// =============================================================================
// Source of truth for pricing, protocol, and quantity: the supplied
// Anti-Aging Treatment Plan reference (RenewMe Medspa template, being
// adapted for MOOV Health branding). Source of truth for timing/compatibility
// mapping: the MOOV Aesthetic Procedure Timing Guide (see timingRules.ts).
//
// PRICING NOTES ON SOURCE FORMAT:
// The source sheet uses "$X/Y" to mean "$X per individual treatment / $Y for
// the standard package." Single un-slashed dollar figures are used
// consistently throughout the source document to mean a flat per-session (or
// per-visit) price — that convention is applied here too. Where the source
// said "Packages" with no number, or gave a range ("$250-300") or "Varies",
// no number is invented — see PriceType docs in ../types.
//
// PATIENT BENEFIT COPY ("standardBenefit"):
// No prewritten patient-education copy was supplied with the source data.
// The descriptions below are DRAFT copy written for this build so the field
// is populated and the UI/PDF can be demonstrated end-to-end. They are
// intentionally cautious, general, and free of outcome guarantees, but they
// are NOT MOOV-approved clinical/marketing language yet — MOOV clinical and
// marketing leadership should review, edit, or replace every entry below
// before this app is used with real patients. Edit only here; the UI reads
// this field directly.
//
// LOCATION AVAILABILITY: no location-specific service matrix was supplied,
// so every service is `availability: 'all'`. See locations.ts.
// =============================================================================

export const services: Service[] = [
  // ---------------------------------------------------------------------
  // Wrinkle Relaxers
  // ---------------------------------------------------------------------
  {
    id: 'botox-dysport',
    categoryId: 'wrinkle-relaxers',
    name: 'Botox / Dysport',
    availability: 'all',
    timingKey: 'botox',
    hasSeparatePricingQuantity: true,
    pricingQuantityLabel: 'units',
    pricing: {
      priceType: 'perUnit',
      individualPrice: 13,
      unitLabel: 'unit',
      sourceLabel: '$13/unit',
    },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 3–4 months',
      sessionIntervalDays: 90,
      sessionIntervalDaysMax: 120,
      isMaintenance: true,
    },
    standardBenefit:
      'A neuromodulator that temporarily relaxes targeted facial muscles to soften the appearance of dynamic wrinkles, such as forehead lines, frown lines, and crow’s feet.',
  },
  {
    id: 'emface',
    categoryId: 'wrinkle-relaxers',
    name: 'EmFace',
    availability: 'all',
    timingKey: 'emface',
    pricing: {
      priceType: 'package',
      individualPrice: 1000,
      packages: [{ quantity: 6, price: 4000, label: 'Buy 4, Get 2 Free (6 sessions)' }],
      sourceLabel: '$1,000/treatment; Buy 4 Get 2 Free: $4,000',
    },
    protocol: {
      standardQuantity: 4,
      frequencyLabel: '4 sessions, 1 week apart',
      sessionIntervalDays: 7,
      isMaintenance: false,
    },
    standardBenefit:
      'A non-invasive treatment that uses electromagnetic and RF energy to tone facial muscles and support skin quality, intended to improve facial contour and firmness over a course of sessions.',
  },

  // ---------------------------------------------------------------------
  // Injectables
  // ---------------------------------------------------------------------
  {
    id: 'cheek-filler',
    categoryId: 'injectables',
    name: 'Cheek Filler / Mid Face',
    availability: 'all',
    timingKey: 'filler',
    pricing: { priceType: 'startingAt', individualPrice: 650, sourceLabel: '$650+' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 6–12 months',
      sessionIntervalDays: 180,
      sessionIntervalDaysMax: 365,
      isMaintenance: true,
    },
    standardBenefit:
      'A dermal filler used to restore or enhance volume in the cheek and mid-face area, intended to support facial contour and structure.',
  },
  {
    id: 'lip-filler',
    categoryId: 'injectables',
    name: 'Lip Filler',
    availability: 'all',
    timingKey: 'filler',
    pricing: { priceType: 'startingAt', individualPrice: 650, sourceLabel: '$650+' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 6–12 months',
      sessionIntervalDays: 180,
      sessionIntervalDaysMax: 365,
      isMaintenance: true,
    },
    standardBenefit:
      'A dermal filler used to add volume and shape to the lips, intended to support a natural-looking, balanced appearance.',
  },
  {
    id: 'lower-face-filler',
    categoryId: 'injectables',
    name: 'Lower Face Filler',
    availability: 'all',
    timingKey: 'filler',
    pricing: { priceType: 'startingAt', individualPrice: 650, sourceLabel: '$650+' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 6–12 months',
      sessionIntervalDays: 180,
      sessionIntervalDaysMax: 365,
      isMaintenance: true,
    },
    standardBenefit:
      'A dermal filler used to define or balance the jawline and chin area, intended to support lower-face structure and profile.',
  },
  {
    id: 'prf-prp-injections',
    categoryId: 'injectables',
    name: 'PRF/PRP Injections (Under Eye, etc.)',
    availability: 'all',
    timingKey: 'prp',
    pricing: {
      priceType: 'package',
      individualPrice: 600,
      packages: [{ quantity: 3, price: 1600, label: '3-session package' }],
      sourceLabel: '$600/1,600',
    },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '3 sessions, 1 month apart',
      sessionIntervalDays: 30,
      isMaintenance: false,
    },
    standardBenefit:
      'Uses the patient’s own platelet-rich plasma or fibrin to support the body’s natural rejuvenation response, commonly used to help address thin or discolored under-eye skin.',
  },
  {
    id: 'kybella',
    categoryId: 'injectables',
    name: 'Kybella',
    availability: 'all',
    timingKey: 'kybella',
    hasSeparatePricingQuantity: true,
    pricingQuantityLabel: 'vials',
    pricing: { priceType: 'perUnit', individualPrice: 500, unitLabel: 'vial', sourceLabel: '$500/vial' },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '2–3 sessions, 4–6 weeks apart',
      sessionIntervalDays: 28,
      sessionIntervalDaysMax: 42,
      isMaintenance: false,
    },
    standardBenefit:
      'An injectable treatment that helps break down fat cells under the chin, intended to gradually reduce the appearance of submental fullness over a series of sessions.',
  },

  // ---------------------------------------------------------------------
  // Advanced Aesthetics
  // ---------------------------------------------------------------------
  {
    id: 'dermaplaning',
    categoryId: 'advanced-aesthetics',
    name: 'Dermaplaning',
    availability: 'all',
    timingKey: 'dermaplaning',
    pricing: { priceType: 'fixed', individualPrice: 160, sourceLabel: '$160' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Monthly', sessionIntervalDays: 30, isMaintenance: true },
    standardBenefit:
      'A manual exfoliation treatment that removes dead skin cells and fine vellus hair, intended to leave skin smoother and help other topical products and treatments absorb more effectively.',
  },
  {
    id: 'hydrafacial',
    categoryId: 'advanced-aesthetics',
    name: 'HydraFacial',
    availability: 'all',
    timingKey: 'hydrafacial',
    pricing: { priceType: 'startingAt', individualPrice: 200, sourceLabel: '$200+' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Weekly to Monthly',
      sessionIntervalDays: 30,
      isMaintenance: true,
      protocolNotes: 'Cadence may range from weekly to monthly depending on skin goals.',
    },
    standardBenefit:
      'A multi-step treatment that cleanses, exfoliates, and hydrates the skin, intended to support a refreshed, even-toned complexion.',
  },
  {
    id: 'prp-hair-restoration',
    categoryId: 'advanced-aesthetics',
    name: 'PRP Hair Restoration',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 3000, sourceLabel: '$3,000/session' },
    protocol: { standardQuantity: 3, frequencyLabel: '3 sessions, 1 month apart', sessionIntervalDays: 30, isMaintenance: false },
    standardBenefit:
      'Uses the patient’s own platelet-rich plasma, delivered to the scalp, to support the body’s natural hair growth cycle over a series of sessions.',
  },
  {
    id: 'red-blue-led',
    categoryId: 'advanced-aesthetics',
    name: 'Red/Blue LED Light',
    availability: 'all',
    timingKey: 'ledLightTherapy',
    pricing: { priceType: 'startingAt', individualPrice: 40, sourceLabel: '$40+' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Daily to Monthly',
      sessionIntervalDays: 30,
      isMaintenance: true,
      protocolNotes: 'Cadence may range from daily to monthly depending on the treatment goal.',
    },
    standardBenefit:
      'Light-based therapy intended to support skin tone (red light) or help manage blemish-prone skin (blue light), typically used as a series.',
  },
  {
    id: 'chemical-peel',
    categoryId: 'advanced-aesthetics',
    name: 'Chemical Peel',
    availability: 'all',
    timingKey: 'chemicalPeel',
    pricing: { priceType: 'range', rangeMin: 250, rangeMax: 300, sourceLabel: '$250–$300' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 2–4 weeks',
      sessionIntervalDays: 21,
      sessionIntervalDaysMax: 28,
      isMaintenance: true,
    },
    standardBenefit:
      'A topical exfoliating treatment intended to improve skin tone, texture, and clarity by removing the outermost layer of skin.',
  },
  {
    id: 'microneedling',
    categoryId: 'advanced-aesthetics',
    name: 'Microneedling',
    availability: 'all',
    timingKey: 'microneedling',
    pricing: {
      priceType: 'package',
      individualPrice: 350,
      packages: [{ quantity: 3, price: 950, label: '3-session package' }],
      sourceLabel: '$350/950',
    },
    protocol: { standardQuantity: 3, frequencyLabel: '3 sessions, 1 month apart', sessionIntervalDays: 30, isMaintenance: false },
    standardBenefit:
      'Uses fine needles to create controlled micro-injuries in the skin, intended to stimulate the body’s natural collagen production and improve the appearance of texture and fine lines.',
  },
  {
    id: 'rf-microneedling',
    categoryId: 'advanced-aesthetics',
    name: 'RF Microneedling (Exion)',
    availability: 'all',
    timingKey: 'rfMicroneedling',
    pricing: { priceType: 'fixed', individualPrice: 1000, sourceLabel: '$1,000/session' },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '3 sessions, 1–2 weeks apart',
      sessionIntervalDays: 7,
      sessionIntervalDaysMax: 14,
      isMaintenance: false,
    },
    standardBenefit:
      'Combines microneedling with radiofrequency energy, intended to help support collagen remodeling and improve the appearance of skin laxity, texture, and fine lines.',
  },
  {
    id: 'vampire-facial',
    categoryId: 'advanced-aesthetics',
    name: 'Vampire Facial (Microneedling w/ PRP or PRF)',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 900,
      packages: [{ quantity: 3, price: 2300, label: '3-session package' }],
      sourceLabel: '$900/2,300',
    },
    protocol: { standardQuantity: 3, frequencyLabel: '3 sessions, 1 month apart', sessionIntervalDays: 30, isMaintenance: false },
    standardBenefit:
      'Combines microneedling with the patient’s own platelet-rich plasma or fibrin, intended to support the skin’s natural rejuvenation response alongside the benefits of microneedling.',
  },
  {
    id: 'rf-clear',
    categoryId: 'advanced-aesthetics',
    name: 'RF Clear (Exion Clear)',
    availability: 'all',
    timingKey: 'exionClear',
    pricing: {
      priceType: 'package',
      individualPrice: 800,
      packages: [{ quantity: 3, price: 2150, label: '3-session package' }],
      sourceLabel: '$800/2,150',
    },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '3 sessions, 1–2 weeks apart',
      sessionIntervalDays: 7,
      sessionIntervalDaysMax: 14,
      isMaintenance: false,
    },
    standardBenefit:
      'An RF skin-clearing treatment often layered on top of RF Microneedling or EmFace in the same session, intended to support overall skin quality and clarity.',
  },
  {
    id: 'emsculpt-neo',
    categoryId: 'advanced-aesthetics',
    name: 'Emsculpt NEO',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 900,
      packages: [{ quantity: 6, price: 3600, label: 'Buy 4, Get 2 Free (6 sessions)' }],
      sourceLabel: '$900/treatment; Buy 4 Get 2 Free: $3,600',
    },
    protocol: { standardQuantity: 4, frequencyLabel: '4 sessions, 1 week apart', sessionIntervalDays: 7, isMaintenance: false },
    standardBenefit:
      'Combines radiofrequency heating with electromagnetic muscle stimulation in one session, intended to support fat reduction and muscle toning in the treated area.',
  },

  // ---------------------------------------------------------------------
  // Regenerative Medicine
  // ---------------------------------------------------------------------
  {
    id: 'peptide-therapy',
    categoryId: 'regenerative-medicine',
    name: 'Peptide Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 300, sourceLabel: '$300' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Daily (30-day kit)', sessionIntervalDays: 30, isMaintenance: true },
    standardBenefit:
      'A physician-guided regimen using targeted peptides, intended to support the body’s wellness, recovery, or metabolic goals as part of an individualized plan.',
  },
  {
    id: 'hormone-replacement-therapy',
    categoryId: 'regenerative-medicine',
    name: 'Hormone Replacement Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'variable', sourceLabel: 'Varies' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Every 3–4 months',
      sessionIntervalDays: 90,
      sessionIntervalDaysMax: 120,
      isMaintenance: true,
    },
    standardBenefit:
      'A physician-supervised program intended to help restore hormone levels toward an optimal range based on lab testing and clinical evaluation.',
  },
  {
    id: 'nad-therapy',
    categoryId: 'regenerative-medicine',
    name: 'NAD+ Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'startingAt', individualPrice: 450, sourceLabel: '$450+' },
    protocol: {
      standardQuantity: 4,
      frequencyLabel: '3–4 sessions in month 1 (initial), then 1 session every 4–8 weeks (maintenance)',
      sessionIntervalDays: 7,
      isMaintenance: false,
      protocolNotes: 'Two-phase protocol: an initial loading month followed by ongoing maintenance sessions every 4–8 weeks.',
    },
    standardBenefit:
      'An infusion therapy intended to support cellular energy production and overall wellness, typically started with an initial series before moving to a maintenance schedule.',
  },
  {
    id: 'red-light-therapy-infrared',
    categoryId: 'regenerative-medicine',
    name: 'Red Light Therapy (Infrared)',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 50, sourceLabel: '$50' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Daily to Weekly',
      sessionIntervalDays: 7,
      isMaintenance: true,
      protocolNotes: 'Cadence may range from daily to weekly depending on the treatment goal.',
    },
    standardBenefit:
      'Infrared light exposure intended to support circulation, recovery, and overall wellness as part of a regular routine.',
  },
  {
    id: 'stem-cell-therapy',
    categoryId: 'regenerative-medicine',
    name: 'Stem Cell Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'variable', sourceLabel: 'Various' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Once', sessionIntervalDays: null, isMaintenance: false },
    standardBenefit:
      'A regenerative therapy intended to support the body’s natural repair processes, offered following individualized clinical evaluation.',
  },
  {
    id: 'iv-ozone-therapy',
    categoryId: 'regenerative-medicine',
    name: 'IV Ozone Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 300, sourceLabel: '$300' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Weekly to Monthly',
      sessionIntervalDays: 30,
      isMaintenance: true,
      protocolNotes: 'Cadence may range from weekly to monthly depending on the treatment goal.',
    },
    standardBenefit:
      'An intravenous therapy intended to support overall wellness as part of an individualized regenerative medicine plan.',
  },
  {
    id: 'vitamin-therapy',
    categoryId: 'regenerative-medicine',
    name: 'Vitamin Therapy',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'variable', sourceLabel: 'Varies' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Daily to Monthly',
      sessionIntervalDays: 30,
      isMaintenance: true,
      protocolNotes: 'Cadence and formulation vary by patient goal.',
    },
    standardBenefit:
      'Targeted vitamin and micronutrient support intended to help address nutritional gaps identified through consultation or lab testing.',
  },
  {
    id: 'weight-loss-program',
    categoryId: 'regenerative-medicine',
    name: 'Weight Loss Program',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'range', rangeMin: 130, rangeMax: 850, sourceLabel: '$130–$850' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Monthly', sessionIntervalDays: 30, isMaintenance: true },
    standardBenefit:
      'A physician-supervised weight management program individualized to the patient’s goals and clinical history.',
  },

  // ---------------------------------------------------------------------
  // Blood Testing
  // ---------------------------------------------------------------------
  {
    id: 'micronutrient-testing',
    categoryId: 'blood-testing',
    name: 'Micronutrient Blood Testing',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 430, sourceLabel: '$430' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Every 6 months', sessionIntervalDays: 180, isMaintenance: true },
    standardBenefit:
      'A lab panel that measures key micronutrient levels, used to help guide personalized wellness and supplementation recommendations.',
  },
  {
    id: 'telomeres-testing',
    categoryId: 'blood-testing',
    name: 'Telomeres Testing',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 330, sourceLabel: '$330' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Annually', sessionIntervalDays: 365, isMaintenance: true },
    standardBenefit:
      'A lab test that estimates cellular aging markers, used as one input into a broader wellness and longevity plan.',
  },
  {
    id: 'hormone-levels-testing',
    categoryId: 'blood-testing',
    name: 'Hormone Levels Testing',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'fixed', individualPrice: 100, sourceLabel: '$100' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Varies', sessionIntervalDays: null, isMaintenance: false },
    standardBenefit:
      'A lab panel that measures current hormone levels, used to help guide individualized treatment recommendations.',
  },
  {
    id: 'custom-labs',
    categoryId: 'blood-testing',
    name: 'Custom Labs',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'variable', sourceLabel: 'Varies' },
    protocol: { standardQuantity: 1, frequencyLabel: 'Varies', sessionIntervalDays: null, isMaintenance: false },
    standardBenefit: 'Additional lab testing tailored to the patient’s individual clinical picture and goals.',
  },

  // ---------------------------------------------------------------------
  // Consultation
  // ---------------------------------------------------------------------
  {
    id: 'skin-care-consultation',
    categoryId: 'consultation',
    name: 'Skin Care Consultation',
    availability: 'all',
    timingKey: null,
    pricing: { priceType: 'complementary', individualPrice: 0, sourceLabel: 'Complementary' },
    protocol: { standardQuantity: 1, frequencyLabel: 'As needed', sessionIntervalDays: null, isMaintenance: false },
    standardBenefit:
      'A one-on-one consultation to assess skin goals and build a personalized product and treatment recommendation.',
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
