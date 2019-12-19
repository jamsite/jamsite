const getRequestHandler = require('./lib/request-handler')
const JamsitePages = require('./lib/jamsite-pages')
const config = require('./config')

const jamsitePages = new JamsitePages(config)
module.exports = getRequestHandler(jamsitePages)
