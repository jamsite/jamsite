const getApiHandler = require('./handlers/handler-api')
const getStaticHandler = require('./handlers/handler-static')
const getPagesHandler = require('./handlers/handler-pages')
const getDefaultHandler = require('./handlers/handler-default')

module.exports = function getRequestHandler (jamsite) {
  const apiHandler = getApiHandler(jamsite)
  const pagesHandler = getPagesHandler(jamsite)
  const staticHandler = getStaticHandler(jamsite)
  const defaultHandler = getDefaultHandler(jamsite)
  const middleware = jamsite.getMiddleware()

  const handler = async (req, res) => {
    if (apiHandler) {
      await apiHandler(req, res)
      if (res.writableEnded || res.headersSent) return
    }

    await pagesHandler(req, res)
    if (res.writableEnded || res.headersSent) return

    await staticHandler(req, res)
    if (res.writableEnded || res.headersSent) return

    return defaultHandler(req, res)
  }

  return middleware
    ? middleware(handler)
    : handler
}
