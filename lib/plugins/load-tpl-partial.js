const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')

module.exports.onAddFile = filter(addPartial)
module.exports.onRemoveFile = filter(removePartial)

function filter (fn) {
  return async function (jamsite, filePath) {
    if (!conventions.isTplPartial(filePath, '.hbs')) return

    const { name } = path.parse(filePath)
    const absFilePath = path.join(jamsite.paths.root, filePath)
    return fn(jamsite, name, absFilePath)
    jamsite.triggerUpdate(filePath)
  }
}

function removePartial ({ handlebars }, name) {
  handlebars.unregisterPartial(name)
}

function addPartial ({ handlebars }, name, filePath) {
  const value = loadPartial(filePath)
  handlebars.registerPartial(name, value)
}

function loadPartial (filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' })
}
