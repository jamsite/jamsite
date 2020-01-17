const fs = require('fs')
const micro = require('micro')
const fsRouter = require('fs-router')

module.exports = function getApiHandler (jamsite) {
  const apiPath = jamsite.config.paths.api
  if (!fs.existsSync(apiPath)) {
    return false
  }

  const match = fsRouter(apiPath)
  return async function apiHandler (req, res) {
    const matched = match(req)
    if (!matched) return

    req.$jamsite = jamsite
    req.$micro = micro

    micro.send(
      res,
      res.statusCode,
      await matched(req, res)
    )
  }
}
