const objectGet = require('./object-get')

const regex = /{{([^{]+?)}}/g

module.exports = function compileFrontmatterTpl (str) {
  const parsed = parseString(str, interpolator)

  if (parsed.length === 1 && typeof parsed[0] !== 'function') {
    // no need to compile as no variables found in a given input
    return null
  }

  return async (data, thisContext) => {
    const result = []
    const promises = []

    parsed.forEach((item, index) => {
      if (typeof item === 'function') {
        promises.push(
          item(data, thisContext).then((value) => {
            result[index] = value
          })
        )
      } else {
        result[index] = item
      }
    })

    await Promise.all(promises)
    return result.length === 1
      ? result[0]
      : result.join('')
  }
}

function parseString (str, getter) {
  const result = []
  let i = 0
  str.replace(regex, (match, p1, offset, str) => {
    const preMatch = str.substring(i, offset)
    if (preMatch !== '') result.push(preMatch)
    result.push(getter(p1.trim()))
    i = offset + match.length
  })
  const tail = str.substring(i)
  if (tail !== '') {
    result.push(tail)
  }
  return result
}

function getParentPath (path) {
  const index = path.lastIndexOf('.')
  return index !== -1
    ? path.substring(0, index)
    : null
}

function interpolatorThis () {
  return async (data, thisContext) => thisContext
}

function interpolatorContext (name) {
  const thisPath = name.substring(5)
  const parentPath = getParentPath(thisPath)

  return async (data, thisContext) => {
    let resolved = objectGet(thisContext, thisPath)

    if (typeof resolved === 'function') {
      if (parentPath === null) {
        resolved = resolved.call(thisContext, data)
      } else {
        const parentObj = objectGet(thisContext, parentPath)
        resolved = resolved.call(parentObj, data)
      }
    }

    return resolved
  }
}

function interpolatorSimple (name) {
  const parentPath = getParentPath(name)
  return async (data) => {
    let resolved = objectGet(data, name)
    if (typeof resolved === 'function') {
      if (parentPath === null) {
        resolved = resolved(data)
      } else {
        const parentObj = objectGet(data, parentPath)
        resolved = resolved.call(parentObj, data)
      }
    }

    return resolved
  }
}

function interpolator (name) {
  if (name === 'this') {
    return interpolatorThis()
  } else if (name.startsWith('this.')) {
    return interpolatorContext(name)
  } else {
    return interpolatorSimple(name)
  }
}
