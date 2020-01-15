const path = require('path')

const cwd = process.cwd()
const root = cwd
const srcRoot = path.join(root, 'src')
const modulesRoot = path.join(root, 'node_modules')

// local config
const config = {
  root: srcRoot,
  modules: modulesRoot,
  port: 3000,
  host: 'localhost'
}

let siteConfig = {}
try {
  siteConfig = require(path.join(srcRoot, 'jamsite-config'))
} catch (e) {
  // no-op
}

module.exports = {
  jamsite: {
    ...siteConfig,
    root: config.root,
    modules: config.modules
  },
  server: {
    // https://nodejs.org/api/net.html#net_server_listen_options_callback
    port: config.port,
    host: config.host
  }
}
