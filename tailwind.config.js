module.exports = {
  purge: [
    './index.html',
    './src/**/*.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
