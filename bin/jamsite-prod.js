#!/usr/bin/env node
const config = require('../config')
const jamsiteHandler = require('../jamsite-handler')
const jamsiteServer = require('../lib/jamsite-server')

jamsiteServer(jamsiteHandler, {
  port: config.port,
  host: config.host
})
