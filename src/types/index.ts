// ============================================================================
// MOOV Health Consultation App — Core Data Model
// ============================================================================
// These types define the shape of every editable dataset in /src/data.
// UI components should never hardcode clinical, pricing, or timing values —
// everything flows from these structures so the datasets can be updated
// centrally without touching component code.

// ---------------------------------------------------------------------------
// Locations & Availability
// ---------------------------------------------------------------------------

export interface Location {
  id: string;
  name: string;
  code: string;
}

/** 'all' = available at every location. Otherwise an explicit allow-list. */
export type Availability = 'all' | string[];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface ServiceCategory {
  id: string;
  name: string;
  sortOrder: number;
  description?: string;
  /** Whether services in this category are topical/procedural aesthetic
   *  treatments covered by the MOOV Aesthetic Procedure Timing Guide.
   *  Non-aesthetic categories (wellness infusions, lab testing, consultation)
   *  are never subject to timing/compatibility checks — they can be
   *  scheduled alongside anything, aesthetic or not. */
  isAesthetic: boolean;
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/**
 * How a service's price is represented in the source data.
 * - 'fixed'      : one flat number per treatment/session
 * - 'package'    : individual per-session price, plus one or more defined
 *                  package tiers (quantity -> total price)
 * - 'perUnit'    : priced per unit (e.g. Botox per unit, Kybella per vial).
 *                  Session count and unit count are tracked separately.
 * - 'range'      : documented as a price range (e.g. "$250-300"). No single
 *                  number is assumed — the provider must confirm/enter the
 *                  exact price before it is included in totals.
 * - 'startingAt' : documented as "$X+". X is usable as a default estimate,
 *                  clearly labeled as a starting price that may vary.
 * - 'variable'    : source data says "Varies" with no anchor number at all.
 *                  Always requires manual entry.
 * - 'complementary': no charge.
 * - 'unavailable' : no pricing data on file at all (e.g. "Packages" with no
 *                  number given). Always requires manual/approved entry.
 */
export type PriceType =
  | 'fixed'
  | 'package'
  | 'perUnit'
  | 'range'
  | 'startingAt'
  | 'variable'
  | 'complementary'
  | 'unavailable';

export interface PackageTier {
  /** number of sessions/units this package covers */
  quantity: number;
  /** total price for the package */
  price: number;
  label?: string;
  /** Extra perk/condition attached to this package (e.g. a bonus treatment
   *  area included free) — shown alongside the package, not folded into the label. */
  notes?: string;
}

export interface ServicePricing {
  priceType: PriceType;
  /** Base per-session (or per-unit) price, when a single anchor number exists.
   *  Absent (undefined) on 'package' services that are NOT sold individually
   *  at all — the engine will require a matching package quantity or a
   *  provider-entered custom price for any other quantity. */
  individualPrice?: number;
  /** For 'range' pricing */
  rangeMin?: number;
  rangeMax?: number;
  /** For 'perUnit' pricing (e.g. "unit", "vial") */
  unitLabel?: string;
  /** For 'perUnit' pricing: minimum unit quantity per the source data (e.g.
   *  Kybella: minimum 2 vials, no package pricing below that). Informational
   *  + enforced as the stepper's floor once units are in use; not a hard
   *  block on 0 (not-yet-decided) before the provider starts entering units. */
  minUnits?: number;
  /** Defined package tiers, keyed by quantity */
  packages?: PackageTier[];
  /** Free-text as it appeared in source data, always shown alongside the parsed value */
  sourceLabel: string;
}

// ---------------------------------------------------------------------------
// Standard Protocol (recommended course of treatment)
// ---------------------------------------------------------------------------

export interface StandardProtocol {
  /** Recommended number of sessions in a standard course. */
  standardQuantity: number;
  /** Human-readable frequency exactly as documented (always shown to provider) */
  frequencyLabel: string;
  /** Parsed target spacing between sessions of THIS service, in days, used for
   *  calendar generation. null = no defined recurring interval (single/maintenance visit). */
  sessionIntervalDays: number | null;
  /** If the source gave a range for spacing (e.g. "4-6 weeks apart") */
  sessionIntervalDaysMax?: number;
  /** True for ongoing maintenance items (e.g. quarterly Botox) rather than a
   *  fixed multi-session course. */
  isMaintenance: boolean;
  /** Clinical/operational protocol notes from source data. */
  protocolNotes?: string;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

/** Keys used by the timing/compatibility engine. null = not covered by the
 *  MOOV Aesthetic Procedure Timing Guide (always "Provider review required"). */
export type TimingProcedureKey =
  | 'chemicalPeel'
  | 'microneedling'
  | 'rfMicroneedling'
  | 'hydrafacial'
  | 'botox'
  | 'filler'
  | 'dermaplaning'
  | 'kybella'
  | 'prp'
  | 'ledLightTherapy'
  | 'emface'
  | 'exionClear';

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  availability: Availability;
  pricing: ServicePricing;
  protocol: StandardProtocol;
  /** Prewritten, patient-friendly explanation of what this treatment generally
   *  addresses. Stored as data (not hardcoded in UI) so MOOV can update centrally.
   *  DRAFT COPY — pending MOOV clinical/marketing review before patient-facing use. */
  standardBenefit: string;
  /** Maps this service to the timing engine. null = no timing guidance exists. */
  timingKey: TimingProcedureKey | null;
  /** True if pricing quantity is tracked separately from session count
   *  (e.g. Botox: sessions are visits, but price is driven by units injected). */
  hasSeparatePricingQuantity?: boolean;
  pricingQuantityLabel?: string;
  /** True for services where a session-quantity control doesn't apply —
   *  effectively always exactly one visit at a time (e.g. filler: one
   *  treatment session, syringe count is the only meaningful quantity).
   *  Hides the "Patient plan quantity" (sessions) stepper in the UI;
   *  the session quantity itself stays fixed at 1 for scheduling/pricing. */
  hideSessionQuantity?: boolean;
}

// ---------------------------------------------------------------------------
// Timing / Compatibility Engine
// ---------------------------------------------------------------------------

export type WaitBasis = 'immediate' | 'days' | 'no-data';

export interface WaitSpec {
  basis: WaitBasis;
  /** Minimum number of days that must elapse. 0 for immediate/same-day. */
  minDays: number;
  /** If the source gave a range, the conservative (longer) end used for
   *  automated suggestions. Equal to minDays when no range was given. */
  suggestedDays: number;
  /** Exact text as it appeared in the source timing guide. */
  sourceLabel: string;
}

/** A directional rule: if `from` is performed, `to` must wait `wait` before
 *  being performed. Order matters — A→B may differ from B→A. */
export interface TimingRule {
  from: TimingProcedureKey;
  to: TimingProcedureKey;
  wait: WaitSpec;
  /** Patient-safe clinical rationale (e.g. "once skin has healed"). Safe to
   *  surface in the patient PDF and patient-facing plan. */
  notes?: string;
  /** Internal-only provenance/operational commentary (e.g. how a conflict
   *  between source workbook tabs was resolved). Provider-facing UI only —
   *  NEVER included in the patient PDF or patient-facing plan. */
  internalNote?: string;
}

export interface CombinationProtocol {
  id: string;
  label: string;
  /** Ordered sequence of timing keys, in the order they must be performed. */
  sequence: TimingProcedureKey[];
  sameSession: boolean;
  notes: string;
}

export type TimingRelationshipStatus =
  | 'approved-same-day'
  | 'compatible-with-spacing'
  | 'provider-review-required'
  | 'conflict';

export interface TimingRelationship {
  serviceAId: string;
  serviceBId: string;
  status: TimingRelationshipStatus;
  /** Human-readable explanation for the provider. */
  summary: string;
  notes?: string;
  /** Internal-only provenance note (e.g. source workbook conflicts). Provider-facing UI only — never the patient PDF. */
  internalNote?: string;
  /** When directional data exists in both directions, both are surfaced. */
  aFirstWait?: WaitSpec;
  bFirstWait?: WaitSpec;
  combinationProtocol?: CombinationProtocol;
}

// ---------------------------------------------------------------------------
// CareCredit Financing (centralized config — update here only)
// ---------------------------------------------------------------------------

export interface CareCreditPromoTier {
  months: 6 | 12 | 18;
  /** Minimum purchase amount required to qualify for this tier, per merchant terms. */
  minPurchaseAmount: number;
  /** Required minimum monthly payment floor per merchant terms (e.g. $29). */
  minMonthlyPayment: number;
}

export interface CareCreditConfig {
  /** Minimum purchase to use any promotional financing at all. */
  globalMinPurchase: number;
  tiers: CareCreditPromoTier[];
  standardApr: number;
  minInterestCharge: number;
  disclosure: string;
  paymentOnlyDisclaimer: string;
}

// ---------------------------------------------------------------------------
// Disclaimers
// ---------------------------------------------------------------------------

export interface ClinicalDisclaimers {
  timingEngine: string;
  financing: string;
  general: string;
}

// ---------------------------------------------------------------------------
// Consultation State (live, in-session data — NOT part of the static dataset)
// ---------------------------------------------------------------------------

export type PricingMethod = 'individual' | 'package' | 'custom' | 'unresolved';

export interface SelectedServiceState {
  serviceId: string;
  /** Session quantity in the patient's plan (may differ from standard). */
  quantity: number;
  /** Separate pricing quantity for perUnit services (e.g. Botox units). */
  pricingQuantity?: number;
  /** Manually entered price for range/variable/unavailable pricing, or an
   *  authorized custom override that replaces computed pricing. */
  customPrice?: number;
  customPriceReason?: string;
  personalizedRecommendation?: string;
  /** Computed at read-time by the pricing engine — stored here after each
   *  recalculation so the UI and PDF can render consistently. */
  pricingMethod: PricingMethod;
  subtotal: number;
}

export interface ScheduledSession {
  id: string;
  serviceId: string;
  sessionNumber: number;
  date: string; // ISO date
  /** True if the provider manually moved this off the algorithm's proposal. */
  manuallyAdjusted: boolean;
}

export interface TimingOverride {
  id: string;
  serviceAId: string;
  serviceBId: string;
  reason: string;
  overriddenBy: string;
  timestamp: string;
}

export interface ConsultationState {
  patientName: string;
  consultationDate: string;
  providerName: string;
  locationId: string | null;
  selectedServices: Record<string, SelectedServiceState>;
  planStartDate: string;
  schedule: ScheduledSession[];
  timingOverrides: TimingOverride[];
  financingTermMonths: 6 | 12 | 18 | null;
}
