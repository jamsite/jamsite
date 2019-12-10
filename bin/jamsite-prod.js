#!/usr/bin/env node
const micro = require('micro')
const config = require('../config')
const jamsiteHandler = require('../jamsite-handler')

micro(jamsiteHandler).listen(config.port)
