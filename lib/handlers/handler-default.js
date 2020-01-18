const errorPage = require('../error-page')

module.exports = function getDefaultHandler (jamsite) {
  const errorsConfig = jamsite.config.errors || {}

  return async function defaultHandler (req, res) {
    const page404 = errorsConfig['404']

    const headers = {
      'Content-Type': 'text/html; charset=utf-8'
    }

    const code = 404
    let content = errorPage('The requested path could not be found.', code)

    if (page404) {
      const page = await jamsite.pageByUrl(page404)
      if (page) {
        content = page.content
        page.setHeaders(res)
      } else {
        throw new Error('Failed loading 404 error page!')
      }
    }

    res.writeHead(code, headers)
    res.end(content)
  }
}
