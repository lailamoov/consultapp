# MOOV Health — Consultation & Treatment Planning App

A tablet-optimized, single-page consultation tool for building personalized multi-service
treatment plans, pricing/package estimates, CareCredit financing estimates, and a
clinically-sequenced 12-month treatment calendar — ending in a polished patient-facing PDF.

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build (type-checks, then builds)
```

## Updating data (no code changes required)

Every clinical, pricing, and financing value lives in `src/data/`, kept deliberately separate
from UI components so MOOV staff (or a future admin tool) can update it centrally:

| File | What it controls |
|---|---|
| `services.ts` | The service catalog: pricing, packages, standard quantity/frequency, patient-education copy, location availability, and the `timingKey` mapping into the timing engine. |
| `categories.ts` | Service category grouping and display order. |
| `locations.ts` | MOOV locations. Currently a single "All Locations" entry — see the note in that file for wiring up a real per-location service matrix when one is supplied. |
| `timingRules.ts` | Directional pairwise timing rules from the MOOV Aesthetic Procedure Timing Guide (`from` → `to`, minimum wait, notes). Extensively commented with how source-workbook inconsistencies were resolved (dedicated per-procedure tabs > Master Matrix; conflicting values resolved to the more conservative/longer wait). |
| `combinationProtocols.ts` | Pre-approved same-day / sequenced combination protocols. |
| `careCreditConfig.ts` | CareCredit promotional tiers, minimums, APR, and disclosure text. |
| `disclaimers.ts` | Clinical and financing disclaimer copy shown in-app and in the PDF. |
| `theme.ts` | Official MOOV brand colors, fonts, and logo paths (sourced from the MOOV brand PowerPoint theme and palette reference). |

**A missing or blank timing-guide entry is never treated as "safe."** The engine
(`src/engine/timing.ts`) treats it as `provider-review-required` and says so explicitly in the UI —
nothing about compatibility is inferred.

## Architecture

- `src/types/` — shared data-model types (single source of truth for shapes above).
- `src/engine/` — pure logic: pricing (`pricing.ts`), timing/compatibility (`timing.ts`),
  12-month scheduling (`scheduler.ts`), CareCredit math (`financing.ts`), and derived
  consultation totals (`consultationSelectors.ts`). No React here — all unit-testable in isolation.
- `src/state/consultationStore.ts` — the live, in-session consultation state (Zustand).
- `src/components/` — UI, organized by feature area (ServiceCatalog, Calendar, Summary,
  Financing, Layout).
- `src/pdf/` — the patient-facing PDF (`@react-pdf/renderer`), intentionally simplified —
  it never renders internal warnings, override reasons, or provenance notes.

## Known gaps pending real MOOV data

- **Location-gated availability**: no per-location service matrix was supplied, so every
  service is currently available everywhere. `Service.availability` and `locations.ts` are
  already wired for this — populate them and the catalog will start enforcing it automatically.
- **Patient-education "Why we're recommending it" copy**: no prewritten copy was supplied.
  The current text in `services.ts` (`standardBenefit`) is draft copy written for this build —
  cautious and non-promissory, but **not yet MOOV-approved**. Have clinical/marketing review
  before real patient use.
