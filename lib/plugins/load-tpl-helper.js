const path = require('path')
const conventions = require('../jamsite-conventions')

module.exports.onAddFile = filter(addHelper)
module.exports.onRemoveFile = filter(removeHelper)

function filter (fn) {
  return async function (jamsite, filePath) {
    if (!conventions.isTplHelper(filePath, '.js')) return

    const { name } = path.parse(filePath)
    const absFilePath = path.join(jamsite.paths.root, filePath)
    fn(jamsite, name, absFilePath)
    jamsite.triggerUpdate(filePath)
  }
}

function removeHelper ({ handlebars }, name, filePath) {
  handlebars.unregisterHelper(name)
  delete require.cache[require.resolve(filePath)]
}

function addHelper ({ handlebars }, name, filePath) {
  const value = loadHelper(filePath)
  handlebars.registerHelper(name, value)
}

function loadHelper (filePath) {
  const resolvedPath = require.resolve(filePath)
  delete require.cache[resolvedPath]
  return require(resolvedPath)
}
