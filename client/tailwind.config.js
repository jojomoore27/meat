/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        farm: {
          forest: '#183222',
          forestDark: '#0e1f14',
          grass: '#2a5e37',
          grassLight: '#3d834e',
          earth: '#8b5e3c',
          earthLight: '#aa7a54',
          sand: '#d2b99b',
          sandLight: '#f4ede4',
          cream: '#faf8f5',
          ivory: '#f3efe8',
          charcoal: '#151a17',
          charcoalLight: '#232b26',
          brass: '#c29b38',
          brassLight: '#e0b853',
          border: 'rgba(42, 94, 55, 0.15)',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(24, 50, 34, 0.08), 0 0 1px 1px rgba(24, 50, 34, 0.05)',
        'premium-hover': '0 30px 60px -20px rgba(24, 50, 34, 0.16), 0 0 1px 1px rgba(24, 50, 34, 0.08)',
        'dark-card': '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        'premium': '1rem',
      }
    },
  },
  plugins: [],
}
