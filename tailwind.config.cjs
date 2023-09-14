/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      width: {
        '20vw': '20vw',
        '40vw': '40vw',
        '60vw': '60vw',
        '80vw': '80vw',
      },
      height: {
        '40vh': '40vh',
        '60vh': '60vh',
        '80vh': '80vh',
      },
    },
  },
  plugins: [],
}
