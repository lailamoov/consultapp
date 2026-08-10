import type { ServiceCategory } from '../types';

// Source: RenewMe/MOOV Anti-Aging Treatment Plan reference document.
// Order matches the source document's section order.
//
// `isAesthetic` controls whether a category's services participate in the
// timing/compatibility engine at all. Only topical/procedural aesthetic
// treatments are covered by the MOOV Aesthetic Procedure Timing Guide —
// wellness infusions, lab testing, and consultations can be scheduled
// alongside any other service (aesthetic or not) with no timing restriction.
export const categories: ServiceCategory[] = [
  {
    id: 'wrinkle-relaxers',
    name: 'Wrinkle Relaxers',
    sortOrder: 1,
    description: 'Neuromodulators and muscle-toning treatments for dynamic lines.',
    isAesthetic: true,
  },
  {
    id: 'injectables',
    name: 'Injectables',
    sortOrder: 2,
    description: 'Dermal fillers and injectable volumizing treatments.',
    isAesthetic: true,
  },
  {
    id: 'advanced-aesthetics',
    name: 'Advanced Aesthetics',
    sortOrder: 3,
    description: 'Skin resurfacing, RF, and body contouring treatments.',
    isAesthetic: true,
  },
  {
    id: 'regenerative-medicine',
    name: 'Regenerative Medicine',
    sortOrder: 4,
    description: 'Wellness and regenerative therapies.',
    isAesthetic: false,
  },
  {
    id: 'blood-testing',
    name: 'Blood Testing',
    sortOrder: 5,
    description: 'Diagnostic and monitoring labs.',
    isAesthetic: false,
  },
  {
    id: 'consultation',
    name: 'Consultation',
    sortOrder: 6,
    isAesthetic: false,
  },
];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return categories.find((c) => c.id === id);
}
