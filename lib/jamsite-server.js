const micro = require('micro')

function registerShutdown (fn) {
  let run = false

  const wrapper = () => {
    if (!run) {
      run = true
      fn()
    }
  }

  process.on('SIGINT', wrapper)
  process.on('SIGTERM', wrapper)
  process.on('exit', wrapper)
}

module.exports = function jamsiteServer (handler, listenOptions) {
  registerShutdown(() => console.log('jamsite: Gracefully shutting down.'))
  const server = micro(handler)

  server.listen(listenOptions, () => {
    const details = server.address()
    registerShutdown(() => server.close())

    if (typeof details === 'string') {
      console.log(`jamsite: Accepting connections on ${details}`)
    } else if (typeof details === 'object' && details.port) {
      console.log(`jamsite: Accepting connections on http://${details.address}:${details.port}`)
    } else {
      console.log('jamsite: Accepting connections')
    }
  })

  return server
}
