import type { ServiceCategory } from '../types';

// Source: RenewMe/MOOV Anti-Aging Treatment Plan reference document.
// Order matches the source document's section order.
export const categories: ServiceCategory[] = [
  {
    id: 'wrinkle-relaxers',
    name: 'Wrinkle Relaxers',
    sortOrder: 1,
    description: 'Neuromodulators and muscle-toning treatments for dynamic lines.',
  },
  {
    id: 'injectables',
    name: 'Injectables',
    sortOrder: 2,
    description: 'Dermal fillers and injectable volumizing treatments.',
  },
  {
    id: 'advanced-aesthetics',
    name: 'Advanced Aesthetics',
    sortOrder: 3,
    description: 'Skin resurfacing, RF, and body contouring treatments.',
  },
  {
    id: 'regenerative-medicine',
    name: 'Regenerative Medicine',
    sortOrder: 4,
    description: 'Wellness and regenerative therapies.',
  },
  {
    id: 'blood-testing',
    name: 'Blood Testing',
    sortOrder: 5,
    description: 'Diagnostic and monitoring labs.',
  },
  {
    id: 'consultation',
    name: 'Consultation',
    sortOrder: 6,
  },
];
