const path = require('path')

const defaultConfig = {
  root: path.join(process.cwd(), 'src'),
  port: 3000,
  host: 'localhost'
}

// todo: dynamic configuration
const config = defaultConfig

module.exports = {
  jamsite: {
    root: config.root
  },
  server: {
    // https://nodejs.org/api/net.html#net_server_listen_options_callback
    port: config.port,
    host: config.host
  }
}
