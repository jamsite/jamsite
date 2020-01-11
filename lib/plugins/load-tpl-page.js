const path = require('path')
const fs = require('fs')
const conventions = require('../jamsite-conventions')
const PageTemplate = require('../page-template')

const HBS_EXTENSION = '.hbs'

module.exports.onNewFile = async function onNewFile (jamsite, filePath) {
  if (!conventions.isTplPage(filePath)) {
    return
  }

  const relFilePath = filePath.substr(conventions.dirnames.TPL_PAGE.length + path.sep.length)
  const absFilePath = path.join(jamsite.paths.root, filePath)

  addPage(jamsite, relFilePath, absFilePath)
}

function addPage (jamsite, relFilePath, filePath) {
  const {
    name,
    value
  } = loadPageTemplate(relFilePath, filePath)

  jamsite.pageTemplatePromises[name] = value
}

function pageNameByFile (relFilePath) {
  if (relFilePath.endsWith(HBS_EXTENSION)) {
    return relFilePath.substr(0, relFilePath.length - HBS_EXTENSION.length)
  }

  return relFilePath
}

function loadPageTemplate (relFilePath, filePath) {
  const name = pageNameByFile(relFilePath)
  const noTempalte = relFilePath === name

  const value = new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err)
        return
      }

      resolve(new PageTemplate(name, data, noTempalte))
    })
  })

  return { name, value }
}
