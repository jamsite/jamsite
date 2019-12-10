const path = require('path')
const fsRouter = require('fs-router')

module.exports = function getApiHandler (jamsite) {
  const match = fsRouter(path.join(jamsite.paths.root, 'api'))
  return async function apiHanler (req, res) {
    const matched = match(req)
    if (!matched) return false

    req.$jamsite = jamsite
    return matched(req, res)
  }
}
