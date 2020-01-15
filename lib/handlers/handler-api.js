const path = require('path')
const fs = require('fs')
const micro = require('micro')
const fsRouter = require('fs-router')

module.exports = function getApiHandler (jamsite) {
  const apiPath = path.join(jamsite.config.paths.src, 'api')
  if (!fs.existsSync(apiPath)) {
    return () => false
  }

  const match = fsRouter(apiPath)
  return async function apiHandler (req, res) {
    const matched = match(req)
    if (!matched) return false

    req.$jamsite = jamsite
    req.$micro = micro
    return matched(req, res)
  }
}
