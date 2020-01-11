const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')

module.exports.onNewFile = async function onNewFile (jamsite, filePath) {
  if (!conventions.isTplPartial(filePath, '.hbs')) {
    return
  }

  addPartial(
    jamsite.handlebars,
    path.join(jamsite.paths.root, filePath)
  )
}

function addPartial (handlebars, filePath) {
  const {
    name,
    value
  } = loadPartial(filePath)

  handlebars.registerPartial(name, value)
}

function loadPartial (filePath) {
  const {
    name
  } = path.parse(filePath)

  const value = fs.readFileSync(filePath, { encoding: 'utf8' })
  return { name, value }
}
