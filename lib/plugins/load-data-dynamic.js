const path = require('path')
const conventions = require('../jamsite-conventions')

module.exports.onNewFile = async function onNewFile (jamsite, filePath) {
  if (!conventions.isDataDynamic(filePath, '.js')) {
    return
  }

  addDataDynamic(
    jamsite,
    path.join(jamsite.paths.root, filePath)
  )
}

function addDataDynamic (jamsite, filePath) {
  const {
    name,
    value
  } = loadDataDynamic(filePath)

  jamsite.dataContext.addDynamic(name, value)
}

function loadDataDynamic (filePath) {
  const {
    name
  } = path.parse(filePath)

  const resolvedPath = require.resolve(filePath)
  delete require.cache[resolvedPath]
  const value = require(resolvedPath)
  return { name, value }
}
