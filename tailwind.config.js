// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-purple-500',
    'bg-purple-600',
    'bg-purple-100',
    'text-purple-500',
    'border-purple-500',
    'hover:bg-purple-600',
    'active:bg-purple-700'
  ],
}