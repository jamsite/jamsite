const path = require('path')

module.exports = function getMiddleware (jamsite) {
  let modulePath
  try {
    modulePath = require.resolve(path.join(jamsite.paths.root, 'middleware'))
  } catch (e) {
    return false
  }

  return require(modulePath)
}
