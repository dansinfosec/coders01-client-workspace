/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the client's existing accent (#4aa485),
        // deepened for accessible contrast. This green is the single CTA/accent.
        brand: {
          50: '#eef7f3',
          100: '#d6ece2',
          200: '#aedcc8',
          300: '#7fc4a8',
          400: '#4aa485', // original site accent
          500: '#2f8568',
          600: '#256b54',
          700: '#1f5544',
          800: '#1a4438',
          900: '#0f2b23',
        },
        // Warm charcoal "roofing" tone for dark sections, header and footer.
        ink: {
          DEFAULT: '#1c1917',
          soft: '#292524',
          muted: '#57534e',
        },
        charcoal: {
          800: '#292524',
          900: '#1c1917',
          950: '#141110',
        },
        // Warm light backgrounds (sand) instead of cold greys.
        sand: {
          50: '#faf8f4',
          100: '#f3efe8',
          200: '#e7e0d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.06)',
        lift: '0 18px 40px rgba(28,25,23,0.16)',
        cta: '0 8px 20px rgba(37,107,84,0.28)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
      },
    },
  },
  plugins: [],
}
