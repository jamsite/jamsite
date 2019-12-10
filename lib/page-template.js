const extractFrontmatter = require('./extract-frontmatter')
const compileFrontmatter = require('./compile-frontmatter')

const ROUTE_REPEAT_KEY = 'repeat'

function parseTemplateData (pageName, templateData) {
  const { frontmatter, template } = extractFrontmatter(templateData)

  const route = normalizeParsedRoute(
    frontmatter.route || {},
    pageName
  )

  delete frontmatter.route

  return {
    route,
    frontmatter,
    template
  }
}

function normalizeParsedRoute (parsedRoute, pageName) {
  if (!('path' in parsedRoute)) {
    parsedRoute.path = '/' + pageName
  }
  return parsedRoute
}

module.exports = class PageTemplate {
  // pageName
  // route
  // parsedRoute
  // parsedFrontmatter
  // template
  // compiledFrontmatterFn
  // compiledTemplateFn

  constructor (pageName, templateData) {
    this.pageName = pageName

    const {
      route,
      frontmatter,
      template
    } = parseTemplateData(pageName, templateData)

    this.parsedRoute = route
    this.parsedFrontmatter = frontmatter
    this.template = template
  }

  async assembleRoute (data) {
    this.route = await (
      compileFrontmatter(this.parsedRoute, ROUTE_REPEAT_KEY)(data)
    )
  }

  async assembleFrontmatter (data, thisContext) {
    if (!this.compiledFrontmatterFn) {
      this.compiledFrontmatterFn = compileFrontmatter(this.parsedFrontmatter)
    }
    return this.compiledFrontmatterFn(data, thisContext)
  }

  renderTemplate (handlebars, data) {
    if (!this.compiledTemplateFn) {
      this.compiledTemplateFn = handlebars.compile(this.template, {
        preventIndent: true
      })
    }
    return this.compiledTemplateFn(data)
  }
}
