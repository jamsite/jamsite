const path = require('path')
const { match: pathMatch } = require('path-to-regexp')

const INDEX_FILE = 'index.html'

function createMatch (pageTemplate, thisContext = null, requestParams = {}) {
  return {
    pageTemplate,
    thisContext,
    requestParams
  }
}

class Router {
  // staticRoutes = {}
  // dynamicRoutes = []

  setPageTemplates (pageTemplates) {
    this.staticRoutes = {}
    this.dynamicRoutes = []

    pageTemplates.forEach((pageTemplate) => {
      if (Array.isArray(pageTemplate.route)) {
        pageTemplate.route.forEach((route) => this.addRoute(route, pageTemplate))
      } else {
        this.addRoute(pageTemplate.route, pageTemplate)
      }
    })
  }

  addRoute (route, pageTemplate) {
    const { pageName } = pageTemplate
    const { rewrite, path: pagePath } = route

    // route target object
    const target = {
      pageTemplate,
      route
    }

    this.addStaticRoute(pageName, pagePath, target)

    if (!rewrite) return

    Array.isArray(rewrite)
      ? rewrite.forEach((rewriteEl) => this.addDynamicRoute(pageName, rewriteEl, target))
      : this.addDynamicRoute(pageName, rewrite, target)
  }

  normalizePath (pageName, pagePath) {
    let normalized = pagePath
    if (normalized.endsWith('/')) {
      normalized += INDEX_FILE
    }

    if (!pagePath.startsWith('/')) {
      normalized = path.join('/', path.dirname(pageName), normalized)
    }

    return normalized
  }

  addStaticRoute (pageName, pagePath, target) {
    const normalizedPath = this.normalizePath(pageName, pagePath)
    this.validateStaticPath(normalizedPath, pageName)
    this.staticRoutes[normalizedPath] = target
  }

  addDynamicRoute (pageName, rewrite, target) {
    const normalizedRoute = this.normalizePath(pageName, rewrite)
    const match = pathMatch(normalizedRoute, { strict: true, decode: decodeURIComponent })
    this.dynamicRoutes.push({ match, target })
  }

  validateStaticPath (pagePath, pageName) {
    if (typeof pagePath !== 'string' || pagePath === '') {
      const msg = `Invalid path value "${pagePath}" resolved for "${pageName}" template`
      throw new Error(msg)
    }
  }

  matchStatic (url) {
    const pagePath = url.endsWith('/') ? url + INDEX_FILE : url
    if (!(pagePath in this.staticRoutes)) {
      return null
    }
    const { pageTemplate, route } = this.staticRoutes[pagePath]
    return createMatch(pageTemplate, route.$thisContext)
  }

  matchDynamic (url) {
    for (const { match, target } of this.dynamicRoutes) {
      const result = match(url)
      if (result) {
        const { pageTemplate, route } = target
        return createMatch(pageTemplate, route.$thisContext, result.params)
      }
    }

    return null
  }

  matchUrl (url) {
    const requestPath = url.split('?', 1)[0]
    return this.matchStatic(requestPath) || this.matchDynamic(requestPath)
  }
}

module.exports = Router
