const extractFrontmatter = require('./extract-frontmatter')
const compileFrontmatter = require('./compile-frontmatter')

const ROUTE_REPEAT_KEY = 'repeat'

function parseTemplateData (pageName, templateData) {
  const { frontmatter, template } = extractFrontmatter(templateData)
  const route = frontmatter.route || {}
  if (!('path' in route)) {
    route.path = pageName
  }

  delete frontmatter.route

  return {
    route,
    frontmatter,
    template
  }
}

module.exports = class PageTemplate {
  // pageName
  // route
  // parsedRoute
  // parsedFrontmatter
  // template
  // compiledFrontmatterFn
  // compiledTemplateFn

  constructor (pageName, templateData, noTemplate = false) {
    this.pageName = pageName

    const {
      route,
      frontmatter,
      template
    } = parseTemplateData(pageName, templateData)

    this.parsedRoute = route
    this.parsedFrontmatter = frontmatter
    this.template = template
    this.noTemplate = noTemplate
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
    if (this.noTemplate) {
      return this.template
    }

    if (!this.compiledTemplateFn) {
      this.compiledTemplateFn = handlebars.compile(this.template, {
        preventIndent: true
      })
    }
    return this.compiledTemplateFn(data, {
      allowProtoPropertiesByDefault: true
    })
  }
}
