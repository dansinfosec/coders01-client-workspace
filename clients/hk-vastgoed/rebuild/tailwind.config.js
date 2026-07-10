/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the client's existing accent (#4aa485),
        // deepened for accessible contrast on white.
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
        ink: {
          DEFAULT: '#0f172a',
          soft: '#1e293b',
          muted: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        lift: '0 12px 32px rgba(15,23,42,0.12)',
      },
      maxWidth: {
        content: '1180px',
      },
    },
  },
  plugins: [],
}
