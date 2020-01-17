const serve = require('serve-handler')

module.exports = function getStaticHandler (jamsite) {
  const { static: serveConfig } = jamsite.config
  return (req, res) => serve(req, res, serveConfig, {
    sendError () {
      // no-op
      // todo: actually it is required to diable 404 errors only
    }
  })
}
