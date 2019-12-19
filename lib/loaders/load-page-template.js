const fs = require('fs')
const PageTemplate = require('../page-template')

const HBS_EXTENSION = '.hbs'

function pageNameByFile (relFilePath) {
  if (relFilePath.endsWith(HBS_EXTENSION)) {
    return relFilePath.substr(0, relFilePath.length - HBS_EXTENSION.length)
  }

  return relFilePath
}

module.exports = function loadPageTemplate (relFilePath, filePath) {
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
