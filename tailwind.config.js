/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000D1A',
        navyDeep: '#0B1B2B',
        mist: '#F5FAFF',
        navy: '#102C49',
        teal: '#00FFE1',
        slate: '#A2ADB8',
        fog: '#D0D8E0',
        deepTeal: '#1E504F',
        paleBlue: '#E0EFFF',
        link: '#0563C1',
      },
      fontFamily: {
        display: ['Case', 'Aptos Display', 'Segoe UI', 'sans-serif'],
        body: ['Case', 'Aptos Display', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,27,43,0.04), 0 8px 24px rgba(11,27,43,0.06)',
        cardHover: '0 4px 10px rgba(11,27,43,0.08), 0 16px 40px rgba(11,27,43,0.10)',
        panel: '0 12px 48px rgba(11,27,43,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
