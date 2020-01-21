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

  loadPluginsFromDir (pluginsPath) {
    if (!fs.existsSync(pluginsPath)) {
      return
    }

    const pluginsFiles = fs.readdirSync(pluginsPath)
    for (const pluginFile of pluginsFiles) {
      const pluginPath = path.join(pluginsPath, pluginFile)
      const pluginConfig = this.getPluginConfig(pluginFile)

      const options = pluginConfig && pluginConfig.options
        ? pluginConfig.options
        : {}

      this.initPlugin(pluginPath, options)
    }
  }

  getPluginConfig (plugin) {
    for (const config of this.jamsite.config.plugins) {
      if (typeof config === 'object' && config !== null) {
        if (config.resolve === plugin) {
          return config
        }
      }
    }
    return null
  }

  loadEmbeddedPlugins () {
    this.loadPluginsFromDir(path.join(__dirname, 'plugins'))
  }

  initPlugin (modulePath, options = {}) {
    const plugin = require(modulePath)

    if (plugin.setOptions) {
      plugin.setOptions(options)
    }

    this.plugins.push(plugin)
  }

  loadPluginFromConfig ({ resolve, options = {} }) {
    const modulePath = path.join(this.jamsite.config.paths.modules, resolve)
    this.initPlugin(modulePath, options)
  }

  loadConfigPlugins () {
    const pluginsConfig = this.jamsite.config.plugins || []
    pluginsConfig.forEach((pluginConfig) => {
      const typeofPluginConfig = typeof pluginConfig
      if (typeofPluginConfig === 'object') {
        if (!pluginConfig.enabled) {
          return
        }

        if (pluginConfig.local) {
          return
        }
      }

      this.loadPluginFromConfig(
        typeofPluginConfig === 'string'
          ? { resolve: pluginConfig }
          : pluginConfig
      )
    })
  }

  loadLocalPlugins () {
    this.loadPluginsFromDir(path.join(this.jamsite.config.paths.src, 'plugins'))
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
  ).filter(([called]) => called
  ).map(([, value]) => value)
}

function callInArraySync (plugins, method, ...options) {
  return plugins.reduce((a, plugin) => {
    if (typeof plugin[method] === 'function') {
      a.push(plugin[method].apply(plugin, options))
    }
    return a
  }, [])
}
