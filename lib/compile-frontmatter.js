const compileFrontmatterTpl = require('./compile-frontmatter-tpl')

const emptyFn = async () => { return {} }

module.exports = function compileFrontmatter (frontmatter, repeaterKey = null) {
  if (frontmatter === null) return emptyFn

  const compiledFrontmatter = getCompiledFrontmatter(frontmatter)
  let repeater = null

  if (repeaterKey !== null && repeaterKey in compiledFrontmatter) {
    // extract repeater from frontmatter
    repeater = compiledFrontmatter[repeaterKey]
    delete compiledFrontmatter[repeaterKey]

    if (repeater === null) {
      throw new Error('Repeater cannot be null')
    }
  }

  return createCompileFn(compiledFrontmatter, repeater)
}

function getCompiledFrontmatter (frontmatter) {
  const compiled = Array.isArray(frontmatter) ? [] : {}

  for (const key in frontmatter) {
    const value = frontmatter[key]

    if (typeof value === 'string') {
      const compiledValue = compileFrontmatterTpl(value)
      if (typeof compiledValue === 'function') {
        compiled[key] = compiledValue
        continue
      }
    } else if (value !== null && typeof value === 'object') {
      compiled[key] = getCompiledFrontmatter(value)
      continue
    }

    compiled[key] = value
  }
  return compiled
}

function createCompileFn (compiledFrontmatter, repeater) {
  if (repeater === null) {
    return (data, thisContext) =>
      resolveFrontmatter(compiledFrontmatter, data, thisContext)
  }

  return async (data) => {
    const resolvedRepeater = typeof repeater === 'function'
      ? await repeater(data)
      : repeater

    return Promise.all(
      resolvedRepeater.map((thisContext) =>
        resolveFrontmatter(compiledFrontmatter, data, thisContext).then((resolved) => {
          // save given context withing resolved object
          resolved.$thisContext = thisContext
          return Promise.resolve(resolved)
        })
      )
    )
  }
}

async function resolveFrontmatter (compiledFrontmatter, data, thisContext) {
  const resolved = Array.isArray(compiledFrontmatter) ? [] : {}
  const promises = []

  for (const key in compiledFrontmatter) {
    const value = compiledFrontmatter[key]

    if (typeof value === 'function') {
      // execute async resolver function
      promises.push(
        value(data, thisContext).then((resolvedValue) => {
          resolved[key] = resolvedValue
        })
      )
    } else if (value !== null && typeof value === 'object') {
      // resolve nested object in frontmatter
      promises.push(
        resolveFrontmatter(value, data, thisContext).then((resolvedValue) => {
          resolved[key] = resolvedValue
        })
      )
    } else {
      resolved[key] = value
    }
  }

  await Promise.all(promises)
  return resolved
}
