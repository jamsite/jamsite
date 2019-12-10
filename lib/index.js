const micro = require('micro')
const JamsitePages = require('./jamsite-pages')
const getRequestHandler = require('./get-request-handler')

module.exports.micro = micro
module.exports.send = micro.send
module.exports.JamsitePages = JamsitePages
module.exports.getRequestHandler = getRequestHandler
