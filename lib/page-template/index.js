const extractFrontmatter = require('./extract-frontmatter')
const compileFrontmatter = require('./compile-frontmatter')

const ROUTE_REPEAT_KEY = 'collection'

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
  // embeddedData

  constructor (pageName, templateData, noTemplate = false, data = null) {
    this.pageName = pageName
    this.embeddedData = data

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

    const mergedData = this.embeddedData
      ? Object.assign({}, this.embeddedData, data)
      : data

    return this.compiledTemplateFn(mergedData, {
      allowProtoPropertiesByDefault: true
    })
  }
}
