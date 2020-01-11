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
    //
  }

  loadLocalPlugins () {
    //
  }

  async callOnBeforeLoad () {
    return callInArray(this.plugins, 'onBeforeLoad', this.jamsite)
  }

  async callOnAfterLoad () {
    return callInArray(this.plugins, 'onAfterLoad', this.jamsite)
  }
}

async function callInArray (plugins, method, options) {
  return Promise.all(plugins.map((plugin) => {
    if (typeof plugin[method] === 'function') {
      return plugin[method](options)
    }
    return Promise.resolve()
  }))
}
