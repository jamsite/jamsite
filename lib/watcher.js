const chokidar = require('chokidar')

module.exports = class Watcher {
  constructor (options) {
    this.options = options
  }

  watch (pattern) {
    const watcher = chokidar.watch(pattern, this.options)
    this.on = watcher.on.bind(watcher)
    this.close = watcher.close.bind(watcher)
  }
}
