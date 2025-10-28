/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,css,html}',
  ],
  corePlugins: {
    preflight: false, // avoid interfering with existing CSS and three.js canvas
  },
  theme: {
    extend: {
      colors: {
        skyWarm: '#FCEAD7',
        groundSand: '#D8C69C',
        waterTeal: '#5FB7B7',
        warmCream: '#FFE8CC',
        sunsetOrange: '#FF9B5E',
      },
      borderRadius: {
        warm: '10px',
      },
      boxShadow: {
        warm: '0 4px 14px rgba(120,70,30,0.15)',
      },
    },
  },
  plugins: [],
};


