const path = require('path')

const DATA_DYNAMIC = 'DATA_DYNAMIC'
const DATA_STATIC = 'DATA_STATIC'
const TPL_PAGE = 'TPL_PAGE'
const TPL_HELPER = 'TPL_HELPER'
const TPL_PARTIAL = 'TPL_PARTIAL'

module.exports = {
  dirnames: {
    [TPL_PAGE]: 'pages',
    [TPL_PARTIAL]: 'partials',
    [TPL_HELPER]: 'helpers',
    [DATA_STATIC]: 'data-static',
    [DATA_DYNAMIC]: 'data-dynamic'
  },

  isTplHelper (filePath, extensions) {
    return matchFile(filePath, this.dirnames.TPL_HELPER, extensions)
  },

  isTplPartial (filePath, extensions) {
    return matchFile(filePath, this.dirnames.TPL_PARTIAL, extensions)
  },

  isTplPage (filePath) {
    return matchFile(filePath, this.dirnames.TPL_PAGE)
  },

  isDataStatic (filePath) {
    return matchFile(filePath, this.dirnames.DATA_STATIC)
  },

  isDataDynamic (filePath, extensions) {
    return matchFile(filePath, this.dirnames.DATA_DYNAMIC, extensions)
  }
}

function matchFile (filePath, dirname, extensions) {
  if (!filePath.startsWith(`${dirname}${path.sep}`)) {
    return false
  }

  if (!extensions) {
    return true
  }

  const { ext } = path.parse(filePath)

  if (ext === '') {
    return false
  }

  if (ext === extensions) {
    return true
  }

  return Array.isArray(extensions) && extensions.includes(ext)
}
