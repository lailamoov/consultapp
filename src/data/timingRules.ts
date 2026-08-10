import type { TimingRule, WaitSpec } from '../types';

// =============================================================================
// MOOV Aesthetic Procedure Timing Guide — directional wait-time rules
// =============================================================================
// Source: "Aesthetic Procedure Timing Guide.xlsx" — the 7 per-procedure tabs
// (Chemical Peel, Microneedling, RF Microneedling (Exion), Hydrafacial, Botox,
// Filler, Dermaplaning) plus the Master Timing Matrix tab, for procedures that
// have no dedicated tab (Kybella, PRP, LED Light Therapy, EmFace, Exion Clear).
//
// IMPORTANT — how conflicting source data was handled:
// The workbook's per-procedure tabs occasionally disagree with each other, and
// the Master Timing Matrix tab occasionally disagrees with the per-procedure
// tabs (transposed AFTER/BEFORE columns in a handful of cells — verified by
// cross-checking against the Combination Protocols tab, which is internally
// consistent with the per-procedure tabs). Per-procedure tabs were treated as
// authoritative over the Master Matrix. Where two authoritative sources still
// disagreed on a specific wait period, the LONGER (more conservative) interval
// was used for that direction, and the conflict is recorded in `notes` so MOOV
// clinical staff can confirm/correct the source workbook. This app never
// silently picks the shorter of two documented intervals.
//
// A pair with NO rule in either direction below is intentionally absent — the
// timing engine treats that as "no established timing guidance" and requires
// provider review. Nothing here is inferred or assumed beyond what the
// workbook states.
// =============================================================================

function ws(sourceLabel: string, minDays: number, suggestedDays: number = minDays): WaitSpec {
  return {
    basis: minDays === 0 ? 'immediate' : 'days',
    minDays,
    suggestedDays,
    sourceLabel,
  };
}

export const timingRules: TimingRule[] = [
  // ---- Chemical Peel -------------------------------------------------------
  { from: 'chemicalPeel', to: 'botox', wait: ws('15 min', 0) },
  { from: 'botox', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'filler', wait: ws('15 min', 0) },
  { from: 'filler', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  {
    from: 'chemicalPeel',
    to: 'microneedling',
    wait: ws('4-6 weeks (conservative)', 42),
    notes: 'Peel first is the standard sequence to exfoliate before microneedling boosts collagen.',
    internalNote:
      'Chemical Peel tab lists 4 weeks; Microneedling tab lists 4-6 weeks for this direction. Conservative 6-week interval applied.',
  },
  {
    from: 'microneedling',
    to: 'chemicalPeel',
    wait: ws('4-6 weeks (conservative)', 42),
    internalNote:
      'Chemical Peel tab lists 4-6 weeks; Microneedling tab lists 4 weeks for this direction. Conservative 6-week interval applied.',
  },

  { from: 'chemicalPeel', to: 'rfMicroneedling', wait: ws('2 weeks', 14) },
  { from: 'rfMicroneedling', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'hydrafacial', wait: ws('2 weeks', 14) },
  {
    from: 'hydrafacial',
    to: 'chemicalPeel',
    wait: ws('1 day–1 week (conservative)', 7),
    internalNote: 'Chemical Peel tab lists 1 week; Hydrafacial tab lists 1 day for this direction. Conservative 1-week interval applied.',
  },

  {
    from: 'chemicalPeel',
    to: 'dermaplaning',
    wait: ws('2 weeks–1 month (conservative)', 30),
    notes: 'Avoid on sensitive skin or for first-time patients.',
    internalNote:
      'Source tabs disagree: Chemical Peel tab lists 2 weeks with a caution note ("never on sensitive skin, never on first-time patients"); Dermaplaning tab lists 1 month and flags this combination as "recommended." Conservative 1-month interval applied — confirm sequencing with provider given the conflicting guidance.',
  },
  {
    from: 'dermaplaning',
    to: 'chemicalPeel',
    wait: ws('Immediate–2 weeks (conservative)', 14),
    internalNote:
      'Source tabs disagree: Chemical Peel tab lists 2 weeks; Dermaplaning tab lists immediately. Conservative 2-week interval applied.',
  },

  { from: 'chemicalPeel', to: 'ledLightTherapy', wait: ws('2 weeks', 14) },
  { from: 'ledLightTherapy', to: 'chemicalPeel', wait: ws('Immediately', 0) },

  { from: 'chemicalPeel', to: 'prp', wait: ws('4 weeks', 28) },
  { from: 'prp', to: 'chemicalPeel', wait: ws('4 weeks', 28) },

  // ---- Microneedling --------------------------------------------------------
  {
    from: 'microneedling',
    to: 'botox',
    wait: ws('Immediate–1 week (conservative)', 7),
    internalNote: 'Microneedling tab lists immediately; Botox tab lists 1 week for this direction. Conservative 1-week interval applied.',
  },
  { from: 'botox', to: 'microneedling', wait: ws('2 weeks', 14) },

  { from: 'microneedling', to: 'filler', wait: ws('Immediately', 0) },
  { from: 'filler', to: 'microneedling', wait: ws('2 weeks', 14) },

  { from: 'microneedling', to: 'hydrafacial', wait: ws('4 weeks', 28), notes: 'Skin must fully heal before Hydrafacial.' },
  { from: 'hydrafacial', to: 'microneedling', wait: ws('1 day', 1) },

  { from: 'dermaplaning', to: 'microneedling', wait: ws('Immediately', 0), notes: 'Allows serums to penetrate deeper.' },
  { from: 'microneedling', to: 'dermaplaning', wait: ws('1 month', 30) },

  {
    from: 'prp',
    to: 'microneedling',
    wait: ws('Same time', 0),
    notes: 'May be performed in the same session.',
    internalNote: 'Vampire Facial is a distinct catalog item — this rule covers standalone PRP + standalone Microneedling selected separately.',
  },
  // microneedling -> prp: no data in Microneedling tab ("—") — provider review required, intentionally omitted.

  // ---- RF Microneedling (Exion) ---------------------------------------------
  { from: 'rfMicroneedling', to: 'botox', wait: ws('2 weeks', 14), notes: 'Once skin has healed.' },
  { from: 'botox', to: 'rfMicroneedling', wait: ws('1-2 weeks', 14) },

  { from: 'rfMicroneedling', to: 'filler', wait: ws('1-2 weeks', 14), notes: 'Once skin has healed.' },
  { from: 'filler', to: 'rfMicroneedling', wait: ws('1-2 weeks', 14) },

  { from: 'rfMicroneedling', to: 'hydrafacial', wait: ws('5 days–1 week', 7), notes: 'Or when skin returns to normal.' },
  { from: 'hydrafacial', to: 'rfMicroneedling', wait: ws('Next day', 1) },

  { from: 'rfMicroneedling', to: 'dermaplaning', wait: ws('2 days', 2), notes: 'Or once skin is healed.' },
  { from: 'dermaplaning', to: 'rfMicroneedling', wait: ws('Immediately', 0) },

  { from: 'rfMicroneedling', to: 'prp', wait: ws('Immediately', 0) },
  { from: 'prp', to: 'rfMicroneedling', wait: ws('1 week', 7) },

  { from: 'rfMicroneedling', to: 'emface', wait: ws('5 days', 5) },
  { from: 'emface', to: 'rfMicroneedling', wait: ws('Immediately', 0), notes: 'Enables the EmFace → RF Microneedling → Exion Clear same-session protocol.' },

  {
    from: 'rfMicroneedling',
    to: 'exionClear',
    wait: ws('Immediately', 0),
    notes: 'RF Microneedling then Exion Clear on top, same session — pre-approved combination.',
  },
  // exionClear -> rfMicroneedling: no data — provider review required.

  // ---- Hydrafacial ------------------------------------------------------------
  { from: 'hydrafacial', to: 'botox', wait: ws('Immediately', 0) },
  { from: 'botox', to: 'hydrafacial', wait: ws('2 weeks', 14) },

  { from: 'hydrafacial', to: 'filler', wait: ws('Immediately', 0) },
  { from: 'filler', to: 'hydrafacial', wait: ws('2 weeks', 14) },

  {
    from: 'hydrafacial',
    to: 'dermaplaning',
    wait: ws('Next day', 1),
  },
  {
    from: 'dermaplaning',
    to: 'hydrafacial',
    wait: ws('Immediately', 0),
    notes: 'Dermaplaning immediately before Hydrafacial, same session — highly recommended, pre-approved combination.',
  },

  { from: 'hydrafacial', to: 'prp', wait: ws('1 day', 1) },
  { from: 'prp', to: 'hydrafacial', wait: ws('4 weeks', 28) },

  // ---- Botox --------------------------------------------------------------
  { from: 'botox', to: 'filler', wait: ws('Immediately', 0) },
  { from: 'filler', to: 'botox', wait: ws('2 weeks', 14) },

  { from: 'botox', to: 'dermaplaning', wait: ws('2 weeks', 14) },
  { from: 'dermaplaning', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'kybella', wait: ws('2 weeks', 14) },
  { from: 'kybella', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'prp', wait: ws('2 weeks', 14) },
  { from: 'prp', to: 'botox', wait: ws('1 week', 7) },

  // ---- Filler ---------------------------------------------------------------
  { from: 'filler', to: 'dermaplaning', wait: ws('2 weeks', 14) },
  { from: 'dermaplaning', to: 'filler', wait: ws('Immediately', 0) },

  {
    from: 'filler',
    to: 'kybella',
    wait: ws('Immediately', 0),
    notes: 'Typically different facial regions, so timing does not matter clinically — confirm treatment areas.',
  },
  { from: 'kybella', to: 'filler', wait: ws('Immediately', 0), notes: 'Typically different facial regions, so timing does not matter clinically — confirm treatment areas.' },

  { from: 'filler', to: 'prp', wait: ws('Immediately', 0) },
  // prp -> filler: no data — provider review required.

  // ---- Dermaplaning -----------------------------------------------------------
  { from: 'dermaplaning', to: 'kybella', wait: ws('Immediately', 0) },
  // kybella -> dermaplaning: no data — provider review required.

  { from: 'dermaplaning', to: 'prp', wait: ws('Immediately', 0) },
  { from: 'prp', to: 'dermaplaning', wait: ws('2 weeks', 14) },

  // ---- EmFace / Exion Clear same-session protocol ---------------------------
  {
    from: 'emface',
    to: 'exionClear',
    wait: ws('Immediately', 0),
    notes: 'EmFace, then Exion Clear right after, same session — pre-approved combination.',
  },
  // exionClear -> emface: no data — provider review required (protocol only defines EmFace-first order).
];
