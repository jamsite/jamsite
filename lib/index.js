const micro = require('micro')
const Jamsite = require('./jamsite')
const getRequestHandler = require('./request-handler')
const jamsiteServer = require('./jamsite-server')
const PageTemplate = require('./page-template')

module.exports.micro = micro
module.exports.Jamsite = Jamsite
module.exports.jamsiteServer = jamsiteServer
module.exports.getRequestHandler = getRequestHandler
module.exports.PageTemplate = PageTemplate

module.exports.start = async function start (jamsite) {
  await jamsite.start()

  jamsiteServer(
    getRequestHandler(jamsite),
    jamsite.config.server
  )
}
