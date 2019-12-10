const _get = require('lodash.get')

module.exports = function objectGet (obj, path) {
  // converting handlebars path style to lodash
  // by replacing '.[' with '['
  const normalizedPath = path.replace(/\.\[/g, '[')
  return _get(obj, normalizedPath)
}
