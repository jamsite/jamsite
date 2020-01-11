const EventEmitter = require('events')
const Handlebars = require('handlebars')
const chokidar = require('chokidar')
const Router = require('./router')
const Plugins = require('./plugins')
const pageHeaders = require('./page-headers')
const DataContext = require('./data-context')

const EVENT_READY = 'ready'

class JamsitePages extends EventEmitter {
  // config
  // handlebars
  // pageTemplatePromises
  // paths
  // router
  // dataContext
  // ready
  // readyPromise
  // chokidarOptions
  // watchers
  // plugins

  defaultConfig () {
    return {
      root: process.cwd(),
      chokidarOptions: {
        persistent: false,
        followSymlinks: false
      }
    }
  }

  constructor (config = {}) {
    super()
    this.pageTemplatePromises = {}
    this.handlebars = Handlebars.create()

    const c = this.config = Object.assign({}, this.defaultConfig(), config)
    this.paths = {
      root: c.root
    }

    this.chokidarOptions = c.chokidarOptions
    this.watchers = []
    this.dataContext = new DataContext()
    this.ready = false
    this.router = new Router()
    this.readyPromise = new Promise((resolve) => this.on(EVENT_READY, resolve))
    this.plugins = new Plugins(this)

    this.loadResources().then(async () => {
      if (!this.chokidarOptions.persistent) {
        this.watchers.forEach((watcher) => watcher.close())
      }

      await this.initRouter()
      this.ready = true
      this.emit(EVENT_READY)
    })
  }

  async initRouter () {
    // wait until all page templates are loaded
    const pageTemplates = await Promise.all(Object.values(this.pageTemplatePromises))
    const data = this.dataContext.data()

    // assemble routes for all page templates
    await Promise.all(
      pageTemplates.map(pageTemplate => pageTemplate.assembleRoute(data))
    )

    this.router.setPageTemplates(pageTemplates)
  }

  async loadFsResources () {
    const watcher = chokidar.watch('**/*', { ...this.chokidarOptions, cwd: this.paths.root })
    this.watchers.push(watcher)
    watcher.on('add', (filePath) => this.plugins.callOnNewFile(filePath))
    return new Promise((resolve) => watcher.on('ready', resolve))
  }

  async loadResources () {
    await this.plugins.callOnBeforeLoad()
    await this.loadFsResources()
    await this.plugins.callOnAfterLoad()
  }

  pageData (url, params, frontmatter) {
    const systemData = { $request: { url, params } }
    return this.dataContext.data(
      frontmatter && typeof frontmatter.data === 'object'
        ? Object.assign({}, frontmatter.data, systemData)
        : Object.assign({}, systemData)
    )
  }

  pageByUrl (url) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!this.ready) await this.readyPromise

      const match = this.router.matchUrl(url)
      if (match === null) {
        resolve(null)
        return
      }

      const { pageTemplate, requestParams, thisContext } = match

      try {
        const frontmatter = await pageTemplate.assembleFrontmatter(
          this.pageData(url, requestParams),
          thisContext
        )

        const headers = pageHeaders(pageTemplate.pageName, frontmatter)
        const pageData = this.pageData(url, requestParams, frontmatter)
        const content = pageTemplate.renderTemplate(this.handlebars, pageData)

        resolve({
          content,
          setHeaders (response) {
            if (frontmatter.response && frontmatter.response['status-code']) {
              response.statusCode = frontmatter.response['status-code']
            }
            for (const name in headers) {
              response.setHeader(name, headers[name])
            }
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

JamsitePages.EVENT_READY = EVENT_READY

module.exports = JamsitePages
