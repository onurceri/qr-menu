/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  variants: {
    extend: {
      margin: ['rtl'],
      padding: ['rtl'],
      space: ['rtl'],
      float: ['rtl'],
      textAlign: ['rtl'],
    },
  },
};
