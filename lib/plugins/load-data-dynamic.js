const path = require('path')
const conventions = require('../jamsite-conventions')

module.exports.onAddFile = filter(addDataDynamic)
module.exports.onRemoveFile = filter(removeDataDynamic)

function filter (fn) {
  return async function (jamsite, filePath) {
    if (!conventions.isDataDynamic(filePath, '.js')) return

    const { name } = path.parse(filePath)
    const absFilePath = path.join(jamsite.config.paths.src, filePath)
    const res = fn(jamsite, name, absFilePath)
    jamsite.triggerUpdate(filePath)
    return res
  }
}

function removeDataDynamic (jamsite, name, filePath) {
  jamsite.dataContext.removeDynamic(name)
  delete require.cache[require.resolve(filePath)]
}

function addDataDynamic (jamsite, name, filePath) {
  const value = loadDataDynamic(filePath)
  jamsite.dataContext.addDynamic(name, value)
}

function loadDataDynamic (filePath) {
  const resolvedPath = require.resolve(filePath)
  delete require.cache[resolvedPath]
  return require(resolvedPath)
}
