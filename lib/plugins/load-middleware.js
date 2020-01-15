const path = require('path')

module.exports.loadMiddleware = function loadMiddleware (jamsite) {
  let modulePath
  try {
    modulePath = require.resolve(path.join(jamsite.config.paths.src, 'middleware'))
  } catch (e) {
    return false
  }

  return require(modulePath)
}
