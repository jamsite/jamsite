const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')
const PageTemplate = require('../page-template')

const HBS_EXTENSION = '.hbs'

module.exports.onAddFile = filter(addPage)
module.exports.onRemoveFile = filter(removePage)

function filter (fn) {
  return async function (jamsite, filePath) {
    if (!conventions.isTplPage(filePath)) return

    const absFilePath = path.join(jamsite.paths.root, filePath)
    const relFilePath = filePath.substr(conventions.dirnames.TPL_PAGE.length + path.sep.length)
    const name = pageNameByFile(relFilePath)
    const res = fn(jamsite, name, relFilePath, absFilePath)
    jamsite.initRouter()
    jamsite.triggerUpdate(filePath)
    return res
  }
}

function removePage (jamsite, name) {
  delete jamsite.pageTemplatePromises[name]
}

function addPage (jamsite, name, relFilePath, filePath) {
  const value = loadPageTemplate(name, relFilePath, filePath)
  jamsite.pageTemplatePromises[name] = value
}

function pageNameByFile (relFilePath) {
  if (relFilePath.endsWith(HBS_EXTENSION)) {
    return relFilePath.substr(0, relFilePath.length - HBS_EXTENSION.length)
  }

  return relFilePath
}

function loadPageTemplate (name, relFilePath, filePath) {
  const noTempalte = relFilePath === name

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err)
        return
      }

      resolve(new PageTemplate(name, data, noTempalte))
    })
  })
}
