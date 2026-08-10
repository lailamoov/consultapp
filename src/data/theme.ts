// =============================================================================
// MOOV Health Brand Tokens
// =============================================================================
// Source: official MOOV brand palette (confirmed against both the embedded
// PowerPoint theme and the official palette reference, with Pantone/PMS
// values), plus the supplied logo pack and "Case" brand typeface. These are
// MOOV's actual approved values — do not substitute placeholder colors.
// Update this file (and tailwind.config.js, which reads a mirror of these
// values) if the brand system changes.
// =============================================================================

export const brand = {
  colors: {
    // Core neutrals
    ink: '#000D1A', // "MOOV Black" — PMS Black 6 C — primary text
    navyDeep: '#0B1B2B', // "Mastery Midnight" — PMS 19-4110 TCX — deep surfaces / footers
    white: '#FFFFFF', // "White" — Process White
    mist: '#F5FAFF', // "Clinical Dawn" — PMS 656 C — app background
    // Primary brand blue
    navy: '#102C49', // "MOOV Blue" — PMS 2767 C — PRIMARY — buttons, headers
    // Signature accent
    teal: '#00FFE1', // "Electric Insight" — PMS 320 C — ACCENT — use as accent/highlight only
    // Supporting neutrals
    slate: '#A2ADB8', // "Integration Grey" — PMS 5435 C
    fog: '#D0D8E0', // "Precision Stone" — PMS 5415 C
    // Secondary accent
    deepTeal: '#1E504F', // "Forest Green" — PMS 5545 C — supporting deep teal-green
    paleBlue: '#E0EFFF', // "Recovery Mist" — PMS 290 C — soft surfaces, chips, hover states
    link: '#0563C1',
  },
  fonts: {
    display: '"Case", "Aptos Display", "Segoe UI", sans-serif',
    body: '"Case", "Aptos Display", "Segoe UI", sans-serif',
  },
  logo: {
    horizontalBlue: '/brand/logos/MOOV.Horizontal.Logo.Blue.svg',
    horizontalWhite: '/brand/logos/MOOV.Horizontal.Logo.White.svg',
    horizontalBlack: '/brand/logos/MOOV.Horizontal.Logo.Black.svg',
    stackedBlue: '/brand/logos/MOOV.Logo.Blue.svg',
    stackedWhite: '/brand/logos/MOOV.Logo.White.svg',
    stackedBlack: '/brand/logos/MOOV.Logo.Black.svg',
  },
} as const;

// Deterministic color coding for services on the calendar/timeline. Every
// swatch below is a mathematically derived tint or shade of one of the six
// official MOOV brand colors above (never an unrelated invented hue), so the
// timeline reads as clearly on-brand even with 8 services shown at once.
// Cycles if there are more selected services than swatches.
export const calendarColorCycle = [
  '#102C49', // navy (brand accent1, as-is)
  '#1E504F', // deep teal (brand accent5, as-is)
  '#00A896', // shade of brand teal (accent2, darkened for text/fill contrast)
  '#0563C1', // brand link blue, as-is
  '#3C5A78', // lighter tint of navy
  '#3E7A72', // lighter tint of deep teal
  '#5A6B7A', // darker shade of brand slate (accent3)
  '#8A96A3', // darker shade of brand fog (accent4)
];
