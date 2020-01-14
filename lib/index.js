const micro = require('micro')
const Jamsite = require('./jamsite')
const getRequestHandler = require('./request-handler')
const jamsiteServer = require('./jamsite-server')

module.exports.micro = micro
module.exports.Jamsite = Jamsite
module.exports.jamsiteServer = jamsiteServer
module.exports.getRequestHandler = getRequestHandler

module.exports.start = function start () {
  const config = require('./config')
  const jamsite = new Jamsite(config.jamsite)

  jamsiteServer(
    getRequestHandler(jamsite),
    config.server
  )
}
