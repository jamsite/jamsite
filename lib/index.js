const micro = require('micro')
const Jamsite = require('./jamsite')
const getRequestHandler = require('./request-handler')
const jamsiteServer = require('./jamsite-server')

module.exports.micro = micro
module.exports.Jamsite = Jamsite
module.exports.jamsiteServer = jamsiteServer
module.exports.getRequestHandler = getRequestHandler

module.exports.start = async function start (sitePath) {
  const jamsite = new Jamsite(sitePath)
  await jamsite.start()

  jamsiteServer(
    getRequestHandler(jamsite),
    jamsite.config.server
  )
}
