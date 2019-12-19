const JS_EXTENSION = '.js'

module.exports = function loadHelper (relFilePath, filePath) {
  const name = relFilePath.substr(0, relFilePath.length - JS_EXTENSION.length)
  const resolvedPath = require.resolve(filePath)
  delete require.cache[resolvedPath]
  const value = require(resolvedPath)
  return { name, value }
}
