/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        card: '#111111',
        card2: '#1a1a1a',
        border: '#2a2a2a',
        gold: '#f5c518',
        accent: '#f5c518',
        'accent-hover': '#ffd700',
        muted: '#888888',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        gotham: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
