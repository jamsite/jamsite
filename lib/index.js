const micro = require('micro')
const JamsitePages = require('./jamsite-pages')
const getRequestHandler = require('./request-handler')
const jamsiteServer = require('./jamsite-server')

module.exports.micro = micro
module.exports.JamsitePages = JamsitePages
module.exports.jamsiteServer = jamsiteServer
module.exports.getRequestHandler = getRequestHandler

module.exports.start = function start () {
  const config = require('../config')
  jamsiteServer(
    getRequestHandler(new JamsitePages(config.jamsite)),
    config.server
  )
}
