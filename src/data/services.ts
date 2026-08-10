import type { Service } from '../types';
import { getCategoryById } from './categories';

// =============================================================================
// MOOV Health Service Catalog
// =============================================================================
// Source of truth for pricing, protocol, and quantity: "Anti-Aging Treatment
// Plan (Packages)" — the MOOV/RenewMe reference with explicit separate
// "Price (Individual)" and "Price (Package)" columns per service. This
// superseded an earlier reference that only had a single ambiguous price
// column; where the two disagreed, this sheet wins. Source of truth for
// timing/compatibility mapping: the MOOV Aesthetic Procedure Timing Guide
// (see timingRules.ts).
//
// PRICING NOTES ON SOURCE FORMAT:
// - "Price (Individual)" → `pricing.individualPrice` (per session/unit).
// - "Price (Package)" → `pricing.packages[]`. Percentage- or perk-based deals
//   ("buy 4 for 15% off", "buy 2, 3rd session half off") are converted to a
//   flat total at the stated quantity using the individual rate as the base
//   (e.g. "buy 4 for 15% off" on a $300 service = 4 × $300 × 0.85 = $1,020) —
//   the resulting dollar amount is arithmetic on the source's own numbers,
//   never an invented discount.
// - A few services are explicitly NOT sold individually at all (e.g. PRP
//   Hair Restoration — "Not allowed to buy individual sessions"). These have
//   `individualPrice` intentionally omitted; the pricing engine requires a
//   provider-entered price for any quantity that doesn't match a defined
//   package. See PriceType docs in ../types.
// - Where a package rule is documented but the individual rate is "Varies"
//   with no anchor number (Vitamin Therapy), the deal is recorded in
//   `protocol.protocolNotes` rather than computed as a packages[] tier — no
//   number is invented.
// - Kybella has no package pricing at all, but does have a stated 2-vial
//   minimum — modeled via `pricing.minUnits`, enforced as the units
//   stepper's floor once the provider starts entering units.
// - NAD+ Therapy is priced as three distinct tiers by treatment goal
//   (Anti-Aging / Mind & Body / Recovery), not one variable-priced service —
//   modeled as three separate catalog entries. The source lists one package
//   rule ("buy 2, 3rd half off, or buy 3 get 1 free") against NAD+ Therapy
//   generally; it's applied here identically to each of the three variants
//   at that variant's own rate — confirm with MOOV if that's not the intent.
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
    hasSeparatePricingQuantity: true,
    pricingQuantityLabel: 'syringes',
    hideSessionQuantity: true,
    pricing: { priceType: 'perUnit', individualPrice: 650, unitLabel: 'syringe', sourceLabel: '$650/syringe — no package pricing' },
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
    hasSeparatePricingQuantity: true,
    pricingQuantityLabel: 'syringes',
    hideSessionQuantity: true,
    pricing: { priceType: 'perUnit', individualPrice: 650, unitLabel: 'syringe', sourceLabel: '$650/syringe — no package pricing' },
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
    hasSeparatePricingQuantity: true,
    pricingQuantityLabel: 'syringes',
    hideSessionQuantity: true,
    pricing: { priceType: 'perUnit', individualPrice: 650, unitLabel: 'syringe', sourceLabel: '$650/syringe — no package pricing' },
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
    pricing: {
      priceType: 'perUnit',
      individualPrice: 500,
      unitLabel: 'vial',
      minUnits: 2,
      sourceLabel: '$500/vial — no package pricing; minimum 2 vials',
    },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '2–3 sessions, 4–6 weeks apart',
      sessionIntervalDays: 28,
      sessionIntervalDaysMax: 42,
      isMaintenance: false,
      protocolNotes: 'No package pricing available for Kybella — priced per vial, with a 2-vial minimum per treatment.',
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
    pricing: { priceType: 'range', rangeMin: 200, rangeMax: 325, sourceLabel: '$200–$325' },
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
    pricing: {
      priceType: 'package',
      // Not sold as individual sessions — individualPrice intentionally omitted.
      packages: [{ quantity: 3, price: 3000, label: '3-session package' }],
      sourceLabel: 'Not available individually — $3,000 for the 3-session package',
    },
    protocol: {
      standardQuantity: 3,
      frequencyLabel: '3 sessions, 1 month apart',
      sessionIntervalDays: 30,
      isMaintenance: false,
      protocolNotes: 'Not sold as individual sessions — only the full 3-session package.',
    },
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
    pricing: {
      priceType: 'package',
      individualPrice: 1000,
      packages: [
        {
          quantity: 3,
          price: 3000,
          label: '3-session package',
          notes: 'Includes 1 extra medium treatment area free with each session.',
        },
      ],
      sourceLabel: '$1,000/session; $3,000 for 3-session package (+1 extra medium area free each session)',
    },
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
    name: 'Peptide Therapy (Sermorelin)',
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
  // NAD+ Therapy is sold as three separate price tiers by treatment goal
  // (not one service with a variable price) — modeled as three catalog
  // entries so each can be selected and priced independently. Package deals
  // ("buy 2, 3rd session half off" / "buy 3, get 1 free") are documented
  // once per NAD+ variant in the source and applied here per-variant at
  // that variant's individual rate — confirm with MOOV if these multi-buy
  // deals were intended to apply identically across all three variants.
  {
    id: 'nad-therapy-antiaging',
    categoryId: 'regenerative-medicine',
    name: 'NAD+ Therapy — Anti-Aging',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 450,
      packages: [
        { quantity: 3, price: 1125, label: 'Buy 2, 3rd Session Half Off' },
        { quantity: 4, price: 1350, label: 'Buy 3, Get 1 Free' },
      ],
      sourceLabel: '$450/session; Buy 2 get 1 half off, or buy 3 get 1 free',
    },
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
    id: 'nad-therapy-mindbody',
    categoryId: 'regenerative-medicine',
    name: 'NAD+ Therapy — Mind & Body',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 800,
      packages: [
        { quantity: 3, price: 2000, label: 'Buy 2, 3rd Session Half Off' },
        { quantity: 4, price: 2400, label: 'Buy 3, Get 1 Free' },
      ],
      sourceLabel: '$800/session; Buy 2 get 1 half off, or buy 3 get 1 free',
    },
    protocol: {
      standardQuantity: 4,
      frequencyLabel: '3–4 sessions in month 1 (initial), then 1 session every 4–8 weeks (maintenance)',
      sessionIntervalDays: 7,
      isMaintenance: false,
      protocolNotes: 'Two-phase protocol: an initial loading month followed by ongoing maintenance sessions every 4–8 weeks.',
    },
    standardBenefit:
      'An infusion therapy intended to support mental clarity, mood, and overall wellness, typically started with an initial series before moving to a maintenance schedule.',
  },
  {
    id: 'nad-therapy-recovery',
    categoryId: 'regenerative-medicine',
    name: 'NAD+ Therapy — Recovery',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 1500,
      packages: [
        { quantity: 3, price: 3750, label: 'Buy 2, 3rd Session Half Off' },
        { quantity: 4, price: 4500, label: 'Buy 3, Get 1 Free' },
      ],
      sourceLabel: '$1,500/session; Buy 2 get 1 half off, or buy 3 get 1 free',
    },
    protocol: {
      standardQuantity: 4,
      frequencyLabel: '3–4 sessions in month 1 (initial), then 1 session every 4–8 weeks (maintenance)',
      sessionIntervalDays: 7,
      isMaintenance: false,
      protocolNotes: 'Two-phase protocol: an initial loading month followed by ongoing maintenance sessions every 4–8 weeks.',
    },
    standardBenefit:
      'An infusion therapy intended to support physical recovery and overall wellness, typically started with an initial series before moving to a maintenance schedule.',
  },
  {
    id: 'red-light-therapy-infrared',
    categoryId: 'regenerative-medicine',
    name: 'Red Light Therapy (Infrared)',
    availability: 'all',
    timingKey: null,
    pricing: {
      priceType: 'package',
      individualPrice: 50,
      packages: [{ quantity: 5, price: 100, label: '5-session package' }],
      sourceLabel: '$50/session; Buy 5 for $100',
    },
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
    pricing: {
      priceType: 'package',
      individualPrice: 300,
      packages: [
        { quantity: 4, price: 1020, label: '4-session package (15% off)' },
        { quantity: 7, price: 1680, label: '7-session package (20% off)' },
      ],
      sourceLabel: '$300/session; Buy 4 for 15% off, Buy 7 for 20% off',
    },
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
    pricing: { priceType: 'variable', sourceLabel: 'Varies; package deal: Buy 4, get 1 free' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'Daily to Monthly',
      sessionIntervalDays: 30,
      isMaintenance: true,
      protocolNotes:
        'Cadence and formulation vary by patient goal. Package: buy 4, get 1 free — exact package price depends on the formulation priced for this patient; provider must confirm.',
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
  // Source: "Overview of All Consultations" staff reference (updated Aug 5,
  // 2026). Only 1 session is ever needed per consultation type, so the
  // session-quantity stepper is hidden; a provider may recommend more than
  // one consultation type in the same plan (no mutual-exclusivity).
  {
    id: 'iv-ozone-consultation',
    categoryId: 'consultation',
    name: 'IV Ozone Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'fixed', individualPrice: 100, sourceLabel: '$100' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: MD. Required before starting IV Ozone Therapy — Ozone Water and Ozone Oil do not require a consultation.',
    },
    standardBenefit: 'A required visit for patients interested in receiving IV Ozone Therapy.',
  },
  {
    id: 'hrt-consultation',
    categoryId: 'consultation',
    name: 'Hormone Replacement Therapy (HRT) Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'fixed', individualPrice: 200, sourceLabel: '$200' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: MD.',
    },
    standardBenefit: 'For patients who want to learn about and explore our hormone therapy program in detail.',
  },
  {
    id: 'health-assessment-consultation',
    categoryId: 'consultation',
    name: 'Health Assessment Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'fixed', individualPrice: 100, sourceLabel: '$100' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: MD. Functions as a primary care visit (medical evaluation, blood work/testing, minor prescriptions, or a deep dive on one service). Telemedicine available upon request.',
    },
    standardBenefit: 'For patients with specific medical needs or general health concerns — functions as a primary care visit.',
  },
  {
    id: 'anti-aging-consultation',
    categoryId: 'consultation',
    name: 'Anti-Aging Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'fixed', individualPrice: 100, sourceLabel: '$100' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: MD. Best for complex medical concerns or patients wanting guidance across our full menu.',
    },
    standardBenefit: 'A comprehensive consultation for patients looking to improve their overall wellness or start an anti-aging regimen, drawing on our full range of services.',
  },
  {
    id: 'skin-wellness-consultation',
    categoryId: 'consultation',
    name: 'Skin & Wellness Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'complementary', individualPrice: 0, sourceLabel: 'Complementary' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: Aesthetic Nurse / MD. Virtual or in-person; in-person always preferred.',
    },
    standardBenefit: 'A complementary consultation for guidance on our aesthetic and wellness services, resulting in a personalized treatment plan.',
  },
  {
    id: 'peptide-consultation',
    categoryId: 'consultation',
    name: 'Peptide Consultation',
    availability: 'all',
    timingKey: null,
    hideSessionQuantity: true,
    pricing: { priceType: 'fixed', individualPrice: 199, sourceLabel: '$199' },
    protocol: {
      standardQuantity: 1,
      frequencyLabel: 'As needed',
      sessionIntervalDays: null,
      isMaintenance: false,
      protocolNotes: 'Provider: MD, NP. Virtual or in-person; in-person always preferred.',
    },
    standardBenefit: 'A personalized evaluation of your health history and goals to determine which peptide therapy, if any, is right for you.',
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

/** Only aesthetic-category services participate in the timing/compatibility
 *  engine — see categories.ts. */
export function isAestheticService(service: Service): boolean {
  return getCategoryById(service.categoryId)?.isAesthetic ?? false;
}
