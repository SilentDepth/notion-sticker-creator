module.exports = function (filename) {
  const fs = require('node:fs')
  const path = require('node:path')
  return fs.readFileSync(path.resolve(__dirname, '../../public/assets', filename))
}
