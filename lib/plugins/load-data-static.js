const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')
const toml = require('toml')
const marked = require('marked')

module.exports.onAddFile = filter(addDataStatic)
module.exports.onRemoveFile = filter(removeDataStatic)

function filter (fn) {
  return async function (jamsite, filePath) {
    if (!conventions.isDataStatic(filePath)) return

    const { name } = path.parse(filePath)
    const absFilePath = path.join(jamsite.config.paths.src, filePath)
    const res = fn(jamsite, name, absFilePath)
    await jamsite.updateRoutes()
    jamsite.triggerUpdate(filePath)
    return res
  }
}

function readFileSync (filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' })
}

const loaders = {
  json (filePath) {
    const content = readFileSync(filePath)
    return JSON.parse(content)
  },
  toml (filePath) {
    const content = readFileSync(filePath)
    return toml.parse(content)
  },
  md (filePath) {
    const content = readFileSync(filePath)
    return marked(content)
  },
  '*' (filePath) {
    return readFileSync(filePath)
  }
}

function removeDataStatic (jamsite, name, filePath) {
  jamsite.dataContext.removeStatic(name)
  delete require.cache[require.resolve(filePath)]
}

function addDataStatic (jamsite, name, filePath) {
  const value = loadDataStatic(filePath)
  jamsite.dataContext.addStatic(name, value)
}

function loadDataStatic (filePath) {
  const { ext } = path.parse(filePath)
  const extension = ext.substr(1)

  return extension in loaders
    ? loaders[extension](filePath)
    : loaders['*'](filePath)
}
