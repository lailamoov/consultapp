import type { Location } from '../types';

// -----------------------------------------------------------------------
// NOTE: No location-specific service matrix was supplied in source data.
// The attached service/pricing reference did not break services out by
// clinic location, so every service in services.ts is currently marked
// `availability: 'all'`.
//
// This file and the `Service.availability` field exist specifically so
// that when a real location × service availability matrix is provided,
// it can be dropped in here (and in each service's `availability` field)
// without any UI or engine changes. Until then, the location picker in
// the app is present but does not restrict service selection.
// -----------------------------------------------------------------------
export const locations: Location[] = [
  { id: 'all-locations', name: 'All MOOV Health Locations', code: 'ALL' },
];
