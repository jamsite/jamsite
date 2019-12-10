const { send } = require('micro')

module.exports = function getPagesHandler (jamsite) {
  return async (req, res) => {
    const page = await jamsite.pageByUrl(req.url)
    if (page === null) return false

    const { setHeaders, content } = page
    setHeaders(res)
    send(res, res.statusCode, content)
  }
}
