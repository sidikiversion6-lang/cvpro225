import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette CVPro225 — vert (couleur du logo)
        primary: {
          50:  '#E6F2EE',
          100: '#C4E1D7',
          200: '#9DCDBD',
          300: '#6FB69E',
          400: '#3E9A7C',
          500: '#0F7B5A',
          600: '#0B5E45',
          700: '#094B37',
          800: '#073A2A',
          900: '#052B1F',
          DEFAULT: '#0F7B5A',
        },
        // Noir profond (premium, sérieux)
        dark:         '#0F172A',
        'dark-light': '#1e293b',
        // Or doux (excellence)
        accent: {
          50:  '#fdf9f2',
          100: '#faf1df',
          200: '#f3dfba',
          300: '#eac78d',
          400: '#dfae63',
          500: '#D4A574',
          600: '#b68554',
          700: '#946844',
          800: '#75523a',
          900: '#5e4330',
          DEFAULT: '#D4A574',
        },
        // Fond principal + gris texte
        bg: '#FAFAF9',
        'text-gray': '#475569',
        // Couleurs identitaires de la charte (vert, rouge, jaune)
        vert:         '#009460',
        'vert-light': '#00b876',
        'vert-dark':  '#006f48',
        rouge:        '#CE1126',
        'rouge-light':'#e8263d',
        'rouge-dark': '#a00d1e',
        jaune:        '#F6BE00',
        'jaune-light':'#ffd033',
        'jaune-dark': '#c99b00',
      },
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
