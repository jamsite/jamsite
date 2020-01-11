const path = require('path')
const conventions = require('../jamsite-conventions')

module.exports.onNewFile = async function onNewFile (jamsite, filePath) {
  if (!conventions.isTplHelper(filePath, '.js')) {
    return
  }

  addHelper(
    jamsite.handlebars,
    path.join(jamsite.paths.root, filePath)
  )
}

function addHelper (handlebars, filePath) {
  const {
    name,
    value
  } = loadHelper(filePath)

  handlebars.registerHelper(name, value)
}

function loadHelper (filePath) {
  const {
    name
  } = path.parse(filePath)
  const resolvedPath = require.resolve(filePath)

  delete require.cache[resolvedPath]
  const value = require(resolvedPath)
  return { name, value }
}
