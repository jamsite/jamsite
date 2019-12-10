const getApiHandler = require('./handler-api')
const getStaticHandler = require('./handler-static')
const getPagesHandler = require('./handler-pages')
const getMiddleware = require('./middleware')

module.exports = function getRequestHandler (jamsite) {
  const apiHandler = getApiHandler(jamsite)
  const pagesHandler = getPagesHandler(jamsite)
  const staticHanlder = getStaticHandler(jamsite)
  const middleware = getMiddleware(jamsite)

  const handler = async (req, res) => {
    const apiRes = await apiHandler(req, res)
    if (apiRes !== false) return apiRes

    const pageRes = await pagesHandler(req, res)
    if (pageRes !== false) return pageRes

    return staticHanlder(req, res)
  }

  return middleware
    ? middleware(handler)
    : handler
}
