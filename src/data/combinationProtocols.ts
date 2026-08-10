import type { CombinationProtocol } from '../types';

// Source: "Combination Protocols" tab of the MOOV Aesthetic Procedure Timing
// Guide. These are the pre-approved same-day / closely-sequenced protocols.
// Sequence order matters — follow it exactly. Do not add combinations here
// that aren't in the supplied guide.
export const combinationProtocols: CombinationProtocol[] = [
  {
    id: 'emface-exionclear',
    label: 'EmFace + Exion Clear',
    sequence: ['emface', 'exionClear'],
    sameSession: true,
    notes: 'EmFace first, then Exion Clear right after — same session.',
  },
  {
    id: 'rfmicro-exionclear',
    label: 'RF Microneedling + Exion Clear',
    sequence: ['rfMicroneedling', 'exionClear'],
    sameSession: true,
    notes: 'RF Microneedling first, then Exion Clear on top — same session.',
  },
  {
    id: 'emface-rfmicro-exionclear',
    label: 'EmFace + RF Microneedling + Exion Clear',
    sequence: ['emface', 'rfMicroneedling', 'exionClear'],
    sameSession: true,
    notes: 'EmFace, then RF Microneedling, then Exion Clear — same session.',
  },
  {
    id: 'peel-microneedling',
    label: 'Chemical Peel + Microneedling',
    sequence: ['chemicalPeel', 'microneedling'],
    sameSession: false,
    notes: 'Chemical Peel first to exfoliate top layers. 4-6 weeks later, begin Microneedling to boost collagen in deeper layers.',
  },
  {
    id: 'hydrafacial-dermaplaning',
    label: 'Hydrafacial + Dermaplaning',
    sequence: ['dermaplaning', 'hydrafacial'],
    sameSession: true,
    notes: '(Highly recommended combination) Dermaplaning immediately before Hydrafacial — same session.',
  },
  {
    id: 'hydrafacial-botox-filler',
    label: 'Hydrafacial + Botox/Filler',
    sequence: ['hydrafacial', 'botox'],
    sameSession: true,
    notes: 'Hydrafacial with RegenGF + Red LED lights enhances injectable results. Applies to Botox or Filler performed same session as Hydrafacial.',
  },
];
