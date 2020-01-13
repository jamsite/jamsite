const EventEmitter = require('events')
const Handlebars = require('handlebars')
const Router = require('./router')
const Plugins = require('./plugins')
const pageHeaders = require('./page-headers')
const DataContext = require('./data-context')
const Watcher = require('./watcher')

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
  // watcher
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

    const c = this.config = Object.assign(
      {},
      this.defaultConfig(),
      config
    )

    this.paths = {
      root: c.root
    }

    this.watcher = new Watcher({
      ...c.chokidarOptions,
      cwd: c.root
    })

    this.dataContext = new DataContext()
    this.ready = false
    this.router = new Router()
    this.plugins = this.initPlugins()

    this.loadResources().then(async () => {
      if (!c.chokidarOptions.persistent) {
        this.watcher.close()
      }

      await this.initRouter()
      this.ready = true
      this.emit(EVENT_READY)
    })
  }

  triggerUpdate () {
    // noop
  }

  getMiddleware () {
    const middleware = this.plugins.getMiddleware()

    return function (handler) {
      if (!middleware.length) {
        return handler
      }

      let thisHandler = handler
      middleware.forEach((middleware) => {
        thisHandler = middleware(thisHandler)
      })

      return thisHandler
    }
  }

  initPlugins () {
    return new Plugins(this)
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
    this.watcher.watch('**/*')
    this.bindWatcher(this.watcher)
    return new Promise((resolve) => this.watcher.on('ready', resolve))
  }

  bindWatcher (watcher) {
    watcher.on('add', (filePath) => this.plugins.callOnAddFile(filePath))
  }

  async loadResources () {
    await this.plugins.callOnBeforeLoadRes()
    await this.loadFsResources()
    await this.plugins.callOnAfterLoadRes()
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
      // wait unit jamsite is ready
      if (!this.ready) {
        await (new Promise((resolve) => this.on(EVENT_READY, resolve)))
      }

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
