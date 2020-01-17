const serve = require('serve-handler')

module.exports = function getStaticHandler (jamsite) {
  const { static } = jamsite.config
  return (req, res) => serve(req, res, static, {
    sendError () {
      // no-op
      // todo: actually it is required to diable 404 errors only
    }
  })
}
