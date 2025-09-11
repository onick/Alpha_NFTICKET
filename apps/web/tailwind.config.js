/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // NFTicket Alfa Brand Colors
        brand: {
          50: '#EEF2FF',
          100: '#DDE4FF',
          200: '#BFC8FF',
          300: '#9AA7FF',
          400: '#6F7DFF',
          500: '#4C5BFF', // Main brand color
          600: '#3C47D6',
          700: '#2E38A8',
          800: '#232A80',
          900: '#1A215F',
        },
        // Keep primary for backwards compatibility
        primary: {
          50: '#EEF2FF',
          100: '#DDE4FF',
          500: '#4C5BFF',
          600: '#3C47D6',
          900: '#1A215F',
        },
        // NFTicket Theme Colors
        background: {
          light: '#F6F7FB',
          'light-muted': '#EEF0F7',
          dark: '#0B0B12',
          'dark-muted': '#0F0F18',
        },
        text: {
          primary: '#f5f6f9',
          muted: '#bfc3cf',
        },
        // Surface effects
        surface: {
          glass: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.12)',
        },
      },
      spacing: {
        'header-h': '72px', // Updated to match NFTicket Alfa
      },
      maxWidth: {
        'page': '1400px', // NFTicket Alfa page width
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'nft-light': '0 10px 30px rgba(14,18,28,.08)',
        'nft-dark': '0 10px 30px rgba(0,0,0,.35)',
      },
    },
  },
  plugins: [],
};