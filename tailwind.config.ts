import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        'primary-dark': '#0284C7',
        'primary-light': '#38BDF8',
        cta: '#F97316',
        'cta-hover': '#EA580C',
        surface: '#F0F9FF',
        heading: '#0C4A6E',
        body: '#334155',
        muted: '#64748B',
      },
      fontFamily: {
        heading: ['Rubik', 'sans-serif'],
        body: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
