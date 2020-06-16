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
    this.router = this.initRouter()
    this.plugins = this.initPlugins()
    this.watcher = null
  }

  initRouter () {
    return new Router({
      basePath: this.config.basePath
    })
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

    const src = path.join(sitePath, conventions.names.DIR_SRC)
    const paths = {
      src,
      root: sitePath,
      var: path.join(sitePath, conventions.names.DIR_VAR),
      dest: path.join(sitePath, conventions.names.DIR_DEST),
      api: path.join(src, conventions.names.DIR_API),
      public: path.join(src, conventions.names.DIR_PUBLIC),
      modules: path.join(sitePath, 'node_modules')
    }

    const host = 'localhost'
    const port = 3000

    return {
      ...siteConfig,

      // NB! dynamically loaded site config cannot override
      // system configuation options defined below
      paths,
      url: siteConfig.url || `http://${host}:${port}`,
      basePath: siteConfig.basePath || '/',
      plugins: siteConfig.plugins || [],
      scripts: siteConfig.scripts || {},
      static: {
        cleanUrls: false,
        symlinks: false,
        etag: true,
        ...siteConfig.static,
        public: paths.public,
        directoryListing: siteConfig.directoryListing || false
      },
      watcher: {
        persistent: false,
        followSymlinks: false
      },
      server: {
        // https://nodejs.org/api/net.html#net_server_listen_options_callback
        port,
        host
      }
    }
  }

  async start () {
    this.watcher = new Watcher({
      ...this.config.watcher,
      cwd: this.config.paths.src
    })

    await this.loadResources()

    if (!this.config.watcher.persistent) {
      this.watcher.close()
    }

    await this.updateRoutes(false)
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

  async updateRoutes (onlyIfReady = true) {
    if (onlyIfReady && !this.ready) return

    // wait until all page templates are loaded
    const pageTemplates = await Promise.all(Object.values(this.pageTemplatePromises))
    const data = this.dataContext.data()

    // assemble routes for all page templates
    await Promise.all(
      pageTemplates.map(pageTemplate => pageTemplate.assembleRoute(data))
    )

    this.router.setPageTemplates(pageTemplates)
    await this.plugins.callOnAfterUpdateRoutes()
  }

  addPageTemplate (name, pageTemplate) {
    this.pageTemplatePromises[name] = pageTemplate instanceof Promise
      ? pageTemplate
      : Promise.resolve(pageTemplate)
  }

  removePageTemplate (name) {
    delete this.pageTemplatePromises[name]
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
    const systemData = {
      $: {
        request: {
          url,
          params
        },
        config: {
          url: this.config.url,
          basePath: this.config.basePath
        }
      }
    }

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

        const headers = assemblePageHeaders(pageTemplate.pageName, frontmatter.response)
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
