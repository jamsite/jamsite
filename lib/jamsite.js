const path = require('path')
const EventEmitter = require('events')
const Handlebars = require('handlebars')
const Router = require('./router')
const Plugins = require('./plugins')
const assemblePageHeaders = require('./assemble-page-headers')
const DataContext = require('./data-context')
const Watcher = require('./watcher')
const conventions = require('./jamsite-conventions')

const EVENT_READY = 'ready'

class Jamsite extends EventEmitter {
  constructor (sitePath) {
    super()
    this.ready = false
    this.pageTemplatePromises = {}
    this.config = this.initConfig(sitePath)
    this.handlebars = Handlebars.create()
    this.dataContext = new DataContext()
    this.router = new Router()
    this.plugins = this.initPlugins()
    this.watcher = null
  }

  initConfig (sitePath) {
    let siteConfig = {}
    try {
      siteConfig = require(path.join(sitePath, conventions.names.CONFIG_MODULE))
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e
      }
    }

    return {
      ...siteConfig,

      // NB! dynamically loaded site config cannot override
      // system configuation options defined below

      paths: {
        root: sitePath,
        src: path.join(sitePath, conventions.names.DIR_SRC),
        var: path.join(sitePath, conventions.names.DIR_VAR),
        dest: path.join(sitePath, conventions.names.DIR_DEST),
        modules: path.join(sitePath, 'node_modules')
      },
      chokidarOptions: {
        persistent: false,
        followSymlinks: false
      },
      server: {
        // https://nodejs.org/api/net.html#net_server_listen_options_callback
        port: 3000,
        host: 'localhost'
      }
    }
  }

  async start () {
    this.watcher = new Watcher({
      ...this.config.chokidarOptions,
      cwd: this.config.paths.src
    })

    await this.loadResources()

    if (!this.config.chokidarOptions.persistent) {
      this.watcher.close()
    }

    await this.initRouter()
    this.ready = true
    this.emit(EVENT_READY)

    return this
  }

  triggerUpdate () {
    // noop
  }

  async build () {
    // todo: save generated files to destination folder
    // save public files
    // create meta file with headers data
    console.error('// todo: generate static files')
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
    this.bindWatcher()
    return new Promise((resolve) => this.watcher.on('ready', resolve))
  }

  bindWatcher () {
    return this.watcher.on('add', (filePath) => this.plugins.callOnAddFile(filePath))
  }

  async loadResources () {
    await this.plugins.callOnBeforeLoadRes()
    await this.loadFsResources()
    await this.plugins.callOnAfterLoadRes()
  }

  assemblePageData (url, params, frontmatter) {
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
          this.assemblePageData(url, requestParams),
          thisContext
        )

        const headers = assemblePageHeaders(pageTemplate.pageName, frontmatter)
        const pageData = this.assemblePageData(url, requestParams, frontmatter)
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

Jamsite.EVENT_READY = EVENT_READY

module.exports = Jamsite
