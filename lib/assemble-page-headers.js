const path = require('path')
const mime = require('mime-types')

module.exports = function assemblePageHeaders (requestPath, options) {
  const headers = []

  if (options && options.headers) {
    Object.assign(headers, options.headers)
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
