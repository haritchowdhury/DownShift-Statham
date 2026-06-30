const path = require('path')

// If you want to use other PostCSS plugins, see the following:
// https://tailwindcss.com/docs/using-with-preprocessors
module.exports = {
  plugins: [
    'tailwindcss',
    path.join(__dirname, 'postcss-replace-deprecated-color-adjust.js'),
    'autoprefixer',
  ],
}
