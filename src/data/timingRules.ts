import type { TimingRule, WaitSpec } from '../types';

// =============================================================================
// MOOV Aesthetic Procedure Timing Guide — directional wait-time rules
// =============================================================================
// Source: "Aesthetic Procedure Timing Guide.xlsx" (corrected version) — the 7
// per-procedure tabs (Chemical Peel, Microneedling, RF Microneedling (Exion),
// Hydrafacial, Botox, Filler, Dermaplaning) plus the Master Timing Matrix tab,
// for procedures with no dedicated tab (Kybella, PRP, LED Light Therapy,
// EmFace, Exion Clear).
//
// HOW THE MASTER MATRIX IS READ (confirmed against the workbook's own "How to
// Use This Guide" tab and cross-checked against every per-procedure tab —
// 62/62 directional edges agreed with zero mismatches):
// Each cell is "AFTER wait / BEFORE wait" at the intersection of a row
// procedure and a column procedure. AFTER = the wait required for the COLUMN
// procedure done AFTER the ROW procedure, i.e. wait(row → column). BEFORE =
// the wait required for the ROW procedure done AFTER the COLUMN procedure,
// i.e. wait(column → row). Worked example from the sheet: cell at
// row=Hydrafacial, col=Chemical Peel = "1 day / 2 weeks" → Chemical Peel can
// be done 1 day AFTER Hydrafacial (wait(hydrafacial → chemicalPeel) = 1 day),
// and Chemical Peel should be done 2 weeks BEFORE Hydrafacial
// (wait(chemicalPeel → hydrafacial) = 2 weeks).
//
// Per-procedure tabs were used as the primary source (they carry clinical
// notes); the Master Matrix fills in the pairs with no dedicated tab (mostly
// LED Light Therapy / EmFace / Exion Clear vs. everything else). Unlike the
// previous version of this guide, this corrected workbook is fully
// self-consistent — every per-procedure tab value matches its Master Matrix
// counterpart, so no conflict-resolution or conservative-rounding logic is
// needed here anymore.
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
  { from: 'chemicalPeel', to: 'botox', wait: ws('Immediately', 0) },
  { from: 'botox', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'filler', wait: ws('Immediately', 0) },
  { from: 'filler', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  {
    from: 'chemicalPeel',
    to: 'microneedling',
    wait: ws('2 weeks', 14),
    notes: 'Peel first to exfoliate; then microneedling boosts collagen in deeper layers.',
  },
  { from: 'microneedling', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'rfMicroneedling', wait: ws('2 weeks', 14) },
  { from: 'rfMicroneedling', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'hydrafacial', wait: ws('2 weeks', 14) },
  { from: 'hydrafacial', to: 'chemicalPeel', wait: ws('1 day', 1) },

  {
    from: 'chemicalPeel',
    to: 'dermaplaning',
    wait: ws('2 weeks', 14),
    notes: 'Avoid on sensitive skin or for first-time patients.',
  },
  {
    from: 'dermaplaning',
    to: 'chemicalPeel',
    wait: ws('Immediately', 0),
    notes: 'Recommended combination.',
  },

  { from: 'chemicalPeel', to: 'ledLightTherapy', wait: ws('1 day', 1) },
  { from: 'ledLightTherapy', to: 'chemicalPeel', wait: ws('Immediately', 0) },

  { from: 'chemicalPeel', to: 'prp', wait: ws('2 weeks', 14) },
  { from: 'prp', to: 'chemicalPeel', wait: ws('2 weeks', 14) },

  { from: 'chemicalPeel', to: 'emface', wait: ws('2 weeks', 14) },
  { from: 'emface', to: 'chemicalPeel', wait: ws('2 days', 2) },

  { from: 'chemicalPeel', to: 'exionClear', wait: ws('2 weeks', 14) },
  { from: 'exionClear', to: 'chemicalPeel', wait: ws('2 weeks', 14) },
  // chemicalPeel <-> kybella: no data — provider review required.

  // ---- Microneedling --------------------------------------------------------
  { from: 'microneedling', to: 'botox', wait: ws('1 week', 7) },
  { from: 'botox', to: 'microneedling', wait: ws('2 weeks', 14) },

  { from: 'microneedling', to: 'filler', wait: ws('1 week', 7) },
  { from: 'filler', to: 'microneedling', wait: ws('2 weeks', 14) },

  {
    from: 'microneedling',
    to: 'hydrafacial',
    wait: ws('2 weeks', 14),
    notes: 'Skin must heal; a Hydrafacial Booster (RegenGF) can support fine lines and rapid healing.',
  },
  { from: 'hydrafacial', to: 'microneedling', wait: ws('1 day', 1) },

  { from: 'microneedling', to: 'dermaplaning', wait: ws('2 weeks', 14) },
  { from: 'dermaplaning', to: 'microneedling', wait: ws('Immediately', 0) },

  { from: 'microneedling', to: 'prp', wait: ws('Same time', 0) },
  { from: 'prp', to: 'microneedling', wait: ws('Same time', 0), notes: 'May be performed in the same session.' },

  { from: 'microneedling', to: 'ledLightTherapy', wait: ws('Immediately', 0) },
  { from: 'ledLightTherapy', to: 'microneedling', wait: ws('Immediately', 0) },

  { from: 'microneedling', to: 'emface', wait: ws('2 weeks', 14) },
  { from: 'emface', to: 'microneedling', wait: ws('2 days', 2) },

  { from: 'microneedling', to: 'exionClear', wait: ws('4 weeks', 28) },
  { from: 'exionClear', to: 'microneedling', wait: ws('4 weeks', 28) },
  // microneedling <-> rfMicroneedling: no data — provider review required.
  // microneedling <-> kybella: no data — provider review required.

  // ---- RF Microneedling (Exion) ---------------------------------------------
  { from: 'rfMicroneedling', to: 'botox', wait: ws('1 week', 7), notes: 'Once skin has healed.' },
  { from: 'botox', to: 'rfMicroneedling', wait: ws('2 weeks', 14) },

  { from: 'rfMicroneedling', to: 'filler', wait: ws('1 week', 7), notes: 'Once skin has healed.' },
  { from: 'filler', to: 'rfMicroneedling', wait: ws('2 weeks', 14) },

  { from: 'rfMicroneedling', to: 'hydrafacial', wait: ws('1 week', 7), notes: 'Or when skin returns to normal.' },
  { from: 'hydrafacial', to: 'rfMicroneedling', wait: ws('1 day', 1) },

  { from: 'rfMicroneedling', to: 'dermaplaning', wait: ws('2 weeks', 14), notes: 'Or once skin is healed.' },
  { from: 'dermaplaning', to: 'rfMicroneedling', wait: ws('Immediately', 0) },

  { from: 'rfMicroneedling', to: 'prp', wait: ws('Immediately', 0) },
  { from: 'prp', to: 'rfMicroneedling', wait: ws('1 week', 7) },

  { from: 'rfMicroneedling', to: 'ledLightTherapy', wait: ws('1 day', 1) },
  { from: 'ledLightTherapy', to: 'rfMicroneedling', wait: ws('1 day', 1) },

  { from: 'rfMicroneedling', to: 'emface', wait: ws('1 week', 7) },
  { from: 'emface', to: 'rfMicroneedling', wait: ws('Immediately', 0) },

  {
    from: 'rfMicroneedling',
    to: 'exionClear',
    wait: ws('Immediately', 0),
    notes: 'RF Microneedling then Exion Clear on top, same session — pre-approved combination.',
  },
  // exionClear -> rfMicroneedling: no data — provider review required.
  // rfMicroneedling <-> kybella: no data — provider review required.

  // ---- Hydrafacial ------------------------------------------------------------
  { from: 'hydrafacial', to: 'botox', wait: ws('Immediately', 0) },
  { from: 'botox', to: 'hydrafacial', wait: ws('2 weeks', 14) },

  { from: 'hydrafacial', to: 'filler', wait: ws('Immediately', 0) },
  { from: 'filler', to: 'hydrafacial', wait: ws('2 weeks', 14) },

  { from: 'hydrafacial', to: 'dermaplaning', wait: ws('1 day', 1), notes: 'Highly recommended combination.' },
  {
    from: 'dermaplaning',
    to: 'hydrafacial',
    wait: ws('Immediately', 0),
    notes: 'Dermaplaning immediately before Hydrafacial, same session — highly recommended, pre-approved combination.',
  },

  { from: 'hydrafacial', to: 'prp', wait: ws('Immediately', 0) },
  { from: 'prp', to: 'hydrafacial', wait: ws('1 week', 7) },

  { from: 'hydrafacial', to: 'ledLightTherapy', wait: ws('Immediately', 0) },
  { from: 'ledLightTherapy', to: 'hydrafacial', wait: ws('Immediately', 0) },

  { from: 'hydrafacial', to: 'emface', wait: ws('1 day', 1) },
  { from: 'emface', to: 'hydrafacial', wait: ws('2 days', 2) },

  { from: 'hydrafacial', to: 'exionClear', wait: ws('1 day', 1) },
  { from: 'exionClear', to: 'hydrafacial', wait: ws('1 week', 7) },
  // hydrafacial <-> kybella: no data — provider review required.

  // ---- Botox --------------------------------------------------------------
  { from: 'botox', to: 'filler', wait: ws('2 weeks', 14) },
  { from: 'filler', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'dermaplaning', wait: ws('2 weeks', 14) },
  { from: 'dermaplaning', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'prp', wait: ws('2 weeks', 14) },
  { from: 'prp', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'ledLightTherapy', wait: ws('2 days', 2) },
  { from: 'ledLightTherapy', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'emface', wait: ws('2 weeks', 14) },
  { from: 'emface', to: 'botox', wait: ws('Immediately', 0) },

  { from: 'botox', to: 'exionClear', wait: ws('2 weeks', 14) },
  { from: 'exionClear', to: 'botox', wait: ws('1 week', 7) },
  // botox <-> kybella: no data — provider review required.

  // ---- Filler ---------------------------------------------------------------
  { from: 'filler', to: 'dermaplaning', wait: ws('2 weeks', 14) },
  { from: 'dermaplaning', to: 'filler', wait: ws('Immediately', 0) },

  {
    from: 'filler',
    to: 'prp',
    wait: ws('2 weeks', 14),
    notes: 'May alternatively be performed the same time, per provider judgment.',
  },
  { from: 'prp', to: 'filler', wait: ws('2 weeks', 14), notes: 'May alternatively be performed the same time, per provider judgment.' },

  { from: 'filler', to: 'emface', wait: ws('2 weeks', 14) },
  { from: 'emface', to: 'filler', wait: ws('2 days', 2) },

  { from: 'filler', to: 'exionClear', wait: ws('2 weeks', 14) },
  { from: 'exionClear', to: 'filler', wait: ws('Immediately', 0) },
  // filler <-> kybella: no data — provider review required.
  // filler <-> ledLightTherapy: no data — provider review required.

  // ---- Dermaplaning -----------------------------------------------------------
  { from: 'dermaplaning', to: 'kybella', wait: ws('Immediately', 0) },
  // kybella -> dermaplaning: no data — provider review required.

  { from: 'dermaplaning', to: 'prp', wait: ws('Immediately', 0) },
  { from: 'prp', to: 'dermaplaning', wait: ws('1 week', 7) },

  { from: 'dermaplaning', to: 'ledLightTherapy', wait: ws('Immediately', 0) },
  { from: 'ledLightTherapy', to: 'dermaplaning', wait: ws('Immediately', 0) },

  { from: 'dermaplaning', to: 'emface', wait: ws('Immediately', 0) },
  { from: 'emface', to: 'dermaplaning', wait: ws('2 days', 2) },

  { from: 'dermaplaning', to: 'exionClear', wait: ws('Immediately', 0) },
  { from: 'exionClear', to: 'dermaplaning', wait: ws('1 week', 7) },

  // ---- PRP / LED / EmFace / Exion Clear (remaining mutual pairs) ------------
  { from: 'prp', to: 'ledLightTherapy', wait: ws('1 week', 7) },
  { from: 'ledLightTherapy', to: 'prp', wait: ws('Immediately', 0) },

  { from: 'prp', to: 'emface', wait: ws('1 week', 7) },
  { from: 'emface', to: 'prp', wait: ws('2 days', 2) },

  { from: 'prp', to: 'exionClear', wait: ws('2 weeks', 14) },
  { from: 'exionClear', to: 'prp', wait: ws('2 weeks', 14) },
  // prp <-> kybella: no data — provider review required.

  { from: 'ledLightTherapy', to: 'exionClear', wait: ws('1 day', 1) },
  { from: 'exionClear', to: 'ledLightTherapy', wait: ws('1 day', 1) },
  // ledLightTherapy <-> kybella: no data — provider review required.
  { from: 'emface', to: 'ledLightTherapy', wait: ws('1 day', 1) },
  // ledLightTherapy -> emface: no data — provider review required.

  {
    from: 'emface',
    to: 'exionClear',
    wait: ws('Immediately', 0),
    notes: 'EmFace, then Exion Clear right after, same session — pre-approved combination.',
  },
  { from: 'exionClear', to: 'emface', wait: ws('1 week', 7) },
  // emface <-> kybella: no data — provider review required.
  // exionClear <-> kybella: no data — provider review required.
];
