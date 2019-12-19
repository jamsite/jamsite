const fs = require('fs')

const HBS_EXTENSION = '.hbs'

module.exports = function loadPartial (relFilePath, filePath) {
  const name = relFilePath.substr(0, relFilePath.length - HBS_EXTENSION.length)
  const value = fs.readFileSync(filePath, { encoding: 'utf8' })
  return { name, value }
}
