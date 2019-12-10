const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const Handlebars = require('handlebars')
const chokidar = require('chokidar')
const Router = require('./router')
const pageHeaders = require('./page-headers')
const DataContext = require('./data-context')
const PageTemplate = require('./page-template')

const DATA_DYNAMIC = 'data-dynamic'
const DATA_STATIC = 'data-static'
const TPL_PAGE = 'page'
const TPL_HELPER = 'helper'
const TPL_PARTIAL = 'partial'
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
  // extensions
  // chokidarOptions
  // watchers

  defaultConfig () {
    return {
      root: process.cwd(),
      dirnames: {
        [TPL_PAGE]: 'pages',
        [TPL_PARTIAL]: 'partials',
        [TPL_HELPER]: 'helpers',
        [DATA_STATIC]: 'data-static',
        [DATA_DYNAMIC]: 'data-dynamic'
      },
      extensions: {
        [TPL_PAGE]: '.hbs',
        [TPL_PARTIAL]: '.hbs',
        [TPL_HELPER]: '.js',
        [DATA_STATIC]: '.json',
        [DATA_DYNAMIC]: '.js'
      },
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
      root: c.root,
      [TPL_PAGE]: path.join(c.root, c.dirnames[TPL_PAGE]),
      [TPL_PARTIAL]: path.join(c.root, c.dirnames[TPL_PARTIAL]),
      [TPL_HELPER]: path.join(c.root, c.dirnames[TPL_HELPER]),
      [DATA_STATIC]: path.join(c.root, c.dirnames[DATA_STATIC]),
      [DATA_DYNAMIC]: path.join(c.root, c.dirnames[DATA_DYNAMIC])
    }

    this.extensions = c.extensions
    this.chokidarOptions = c.chokidarOptions
    this.watchers = []
    this.dataContext = new DataContext()
    this.ready = false
    this.router = new Router()
    this.readyPromise = new Promise((resolve) => this.on(EVENT_READY, resolve))

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

  addFile (type, filePath) {
    if (type === TPL_PAGE) {
      this.addPage(filePath)
    } else if (type === TPL_PARTIAL) {
      this.addPartial(filePath)
    } else if (type === TPL_HELPER) {
      this.addHelper(filePath)
    } else if (type === DATA_STATIC) {
      this.addDataStatic(filePath)
    } else if (type === DATA_DYNAMIC) {
      this.addDataDynamic(filePath)
    }
  }

  bindWatcherEvents (watcher, type) {
    watcher.on('add', (filePath) => this.addFile(type, filePath))
  }

  fileWatcher (type) {
    const matcher = '**/*' + this.extensions[type]
    const cwd = this.paths[type]

    const watcher = chokidar.watch(matcher, { ...this.chokidarOptions, cwd })
    this.watchers.push(watcher)

    this.bindWatcherEvents(watcher, type)
    return new Promise((resolve) => watcher.on('ready', resolve))
  }

  loadResources () {
    return Promise.all([
      this.fileWatcher(TPL_PAGE),
      this.fileWatcher(TPL_PARTIAL),
      this.fileWatcher(TPL_HELPER),
      this.fileWatcher(DATA_STATIC),
      this.fileWatcher(DATA_DYNAMIC)
    ])
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

  absPath (type, filePath) {
    return path.join(this.paths[type], filePath)
  }

  loadPage (filePath, pageName) {
    return new Promise((resolve, reject) => {
      const absPath = this.absPath(TPL_PAGE, filePath)
      fs.readFile(absPath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        resolve(new PageTemplate(
          pageName,
          data
        ))
      })
    })
  }

  loadPartial (filePath) {
    const absPath = this.absPath(TPL_PARTIAL, filePath)
    return fs.readFileSync(absPath, { encoding: 'utf8' })
  }

  loadHelper (filePath) {
    const absPath = this.absPath(TPL_HELPER, filePath)
    return require(absPath)
  }

  loadDataStatic (filePath) {
    const absPath = this.absPath(DATA_STATIC, filePath)
    return require(absPath)
  }

  loadDataDynamic (filePath) {
    const absPath = this.absPath(DATA_DYNAMIC, filePath)
    return require(absPath)
  }

  filePathToAssetName (type, filePath) {
    return filePath.substr(0, filePath.length - this.extensions[type].length)
  }

  addDataStatic (filePath) {
    const name = this.filePathToAssetName(DATA_STATIC, filePath)
    this.dataContext.addStatic(name, this.loadDataStatic(filePath))
  }

  addDataDynamic (filePath) {
    const name = this.filePathToAssetName(DATA_DYNAMIC, filePath)
    this.dataContext.addDynamic(name, this.loadDataDynamic(filePath))
  }

  addPage (filePath) {
    const pageName = this.filePathToAssetName(TPL_PAGE, filePath)
    this.pageTemplatePromises[pageName] = this.loadPage(filePath, pageName)
    return this.pageTemplatePromises[pageName]
  }

  addPartial (filePath) {
    const partialName = this.filePathToAssetName(TPL_PARTIAL, filePath)
    const partial = this.loadPartial(filePath)
    this.handlebars.registerPartial(partialName, partial)
  }

  addHelper (filePath) {
    const helperName = this.filePathToAssetName(TPL_HELPER, filePath)
    const helper = this.loadHelper(filePath)
    this.handlebars.registerHelper(helperName, helper)
  }
}

JamsitePages.DATA_STATIC = DATA_STATIC
JamsitePages.DATA_DYNAMIC = DATA_DYNAMIC
JamsitePages.TPL_PAGE = TPL_PAGE
JamsitePages.TPL_HELPER = TPL_HELPER
JamsitePages.TPL_PARTIAL = TPL_PARTIAL
JamsitePages.EVENT_READY = EVENT_READY

module.exports = JamsitePages
