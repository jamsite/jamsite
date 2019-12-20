#!/usr/bin/env node
const config = require('../config')
const JamsitePages = require('../lib/jamsite-pages')
const jamsiteServer = require('../lib/jamsite-server')
const getRequestHandler = require('../lib/request-handler')

jamsiteServer(
  getRequestHandler(new JamsitePages(config.jamsite)),
  config.server
)
