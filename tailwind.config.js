module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      height: theme => ({
        '112': '28rem',
        '120': '30rem',
      }),
      minHeight: theme => ({
        '80': '20rem',
        '64': '16rem',
      }),
      colors: {
        palette: {
          lighter: '#F6F3EE',
          light: '#D8CAB7',
          primary: '#9A4E32',
          dark: '#2D241E',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          900: '#1c1917',
          950: '#0c0a09',
        },
        terracotta: {
          600: '#A85336',
          700: '#8C432B',
        },
        emerald: {
          50: '#ecfdf5',
          700: '#047857',
        },
      },
      fontFamily: {
        primary: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: 'class',
    }),
  ],
}
