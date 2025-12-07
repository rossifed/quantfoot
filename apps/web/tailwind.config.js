/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        dark: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "linear-gradient(to right, rgb(15 23 42 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.5) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
