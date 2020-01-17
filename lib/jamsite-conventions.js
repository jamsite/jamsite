const path = require('path')

const DATA_DYNAMIC = 'DATA_DYNAMIC'
const DATA_STATIC = 'DATA_STATIC'
const TPL_PAGE = 'TPL_PAGE'
const TPL_HELPER = 'TPL_HELPER'
const TPL_PARTIAL = 'TPL_PARTIAL'
const DIR_SRC = 'DIR_SRC'
const DIR_VAR = 'DIR_VAR'
const DIR_DEST = 'DIR_DEST'
const CONFIG_MODULE = 'CONFIG_MODULE'
const DIR_API = 'DIR_API'
const DIR_PUBLIC = 'DIR_PUBLIC'

module.exports = {
  names: {
    [TPL_PAGE]: 'pages',
    [TPL_PARTIAL]: 'partials',
    [TPL_HELPER]: 'helpers',
    [DATA_STATIC]: 'data-static',
    [DATA_DYNAMIC]: 'data-dynamic',
    [DIR_SRC]: 'src',
    [DIR_VAR]: 'var',
    [DIR_DEST]: 'dest',
    [DIR_API]: 'api',
    [DIR_PUBLIC]: 'public',
    [CONFIG_MODULE]: 'jamsite-config'
  },

  isTplHelper (filePath, extensions) {
    return matchFile(filePath, this.names.TPL_HELPER, extensions)
  },

  isTplPartial (filePath, extensions) {
    return matchFile(filePath, this.names.TPL_PARTIAL, extensions)
  },

  isTplPage (filePath) {
    return matchFile(filePath, this.names.TPL_PAGE)
  },

  isDataStatic (filePath) {
    return matchFile(filePath, this.names.DATA_STATIC)
  },

  isDataDynamic (filePath, extensions) {
    return matchFile(filePath, this.names.DATA_DYNAMIC, extensions)
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
