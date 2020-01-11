const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')
const toml = require('toml')
const marked = require('marked')

const loaders = {
  json (filePath) {
    const content = fs.readFileSync(filePath, { encoding: 'utf8' })
    return JSON.parse(content)
  },
  toml (filePath) {
    const content = fs.readFileSync(filePath, { encoding: 'utf8' })
    return toml.parse(content)
  },
  md (filePath) {
    const content = fs.readFileSync(filePath, { encoding: 'utf8' })
    return marked(content)
  },
  '*' (filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf8' })
  }
}

module.exports.onNewFile = async function onNewFile (jamsite, filePath) {
  if (!conventions.isDataStatic(filePath)) {
    return
  }

  addDataStatic(
    jamsite,
    path.join(jamsite.paths.root, filePath)
  )
}

function addDataStatic (jamsite, filePath) {
  const {
    name,
    value
  } = loadDataStatic(filePath)

  jamsite.dataContext.addStatic(name, value)
}

function loadDataStatic (filePath) {
  const {
    name,
    ext
  } = path.parse(filePath)

  const extension = ext.substr(1)

  const value = extension in loaders
    ? loaders[extension](filePath)
    : loaders['*'](filePath)

  return { name, value }
}
