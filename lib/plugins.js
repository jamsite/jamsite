const path = require('path')
const fs = require('fs')

module.exports = class Plugins {
  constructor (jamsite) {
    this.plugins = []
    this.jamsite = jamsite

    this.loadEmbeddedPlugins()
    this.loadConfigPlugins()
    this.loadLocalPlugins()
  }

  loadEmbeddedPlugins () {
    const pluginsPath = path.join(__dirname, 'plugins')
    const pluginsFiles = fs.readdirSync(pluginsPath)

    for (const pluginFile of pluginsFiles) {
      const pluginPath = path.join(pluginsPath, pluginFile)
      this.plugins.push(require(pluginPath))
    }
  }

  loadConfigPlugins () {
    // plugins defined in config
  }

  loadLocalPlugins () {
    // plugins embedded with site
  }

  getMiddleware () {
    return callInArraySync(this.plugins, 'loadMiddleware', this.jamsite)
      .filter((middleware) => middleware)
  }

  callOnAddFile (filePath) {
    return callInArraySync(this.plugins, 'onAddFile', this.jamsite, filePath)
  }

  callOnRemoveFile (filePath) {
    return callInArraySync(this.plugins, 'onRemoveFile', this.jamsite, filePath)
  }

  async callOnBeforeLoadRes () {
    return callInArray(this.plugins, 'onBeforeLoadRes', this.jamsite)
  }

  async callOnAfterLoadRes () {
    return callInArray(this.plugins, 'onAfterLoadRes', this.jamsite)
  }
}

async function callInArray (plugins, method, ...options) {
  return (
    await Promise.all(plugins.map((plugin) =>
      typeof plugin[method] === 'function'
        ? [true, plugin[method].apply(plugin, options)]
        : Promise.resolve([false])
    ))
  )
  .filter(([called]) => called)
  .map(([, value]) => value)
}

function callInArraySync (plugins, method, ...options) {
  return plugins.reduce((a, plugin) => {
    if (typeof plugin[method] === 'function') {
      a.push(plugin[method].apply(plugin, options))
    }
    return a
  }, [])
}
