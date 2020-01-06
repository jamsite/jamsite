const fs = require('fs')
const path = require('path')
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

module.exports = function loadDataStatic (relFilePath, filePath) {
  const {
    name,
    ext
  } = path.parse(relFilePath)

  const extension = ext.substr(1)

  const value = extension in loaders
    ? loaders[extension](filePath)
    : loaders['*'](filePath)

  return { name, value }
}
