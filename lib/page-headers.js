const path = require('path')
const mime = require('mime-types')

module.exports = function pageHeaders (requestPath, frontmatter) {
  const { response } = frontmatter
  const headers = []

  if (response && response.headers) {
    Object.assign(headers, response.headers)
    keysToLowerCase(headers)
  }

  ensureContentType(requestPath, headers)
  return headers
}

function ensureContentType (pageName, headers) {
  if (!('content-type' in headers)) {
    const contentType = mime.contentType(path.extname(pageName))
    if (contentType) headers['content-type'] = contentType
  }
}

function keysToLowerCase (obj) {
  for (const key in obj) {
    obj[key] = obj[key].toLowerCase()
  }
}
