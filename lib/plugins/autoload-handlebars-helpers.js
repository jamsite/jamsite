const path = require('path')

module.exports.onBeforeLoad = async function onBeforeLoad (jamsite) {
  handlebarsHelpers(jamsite)
}

function handlebarsHelpers (jamsite) {
  let resolved
  try {
    resolved = require.resolve(path.join(jamsite.paths.root, '..', 'node_modules', 'handlebars-helpers'))
  } catch (e) {
    return
  }

  const helpers = require(resolved)
  helpers({ handlebars: jamsite.handlebars })
}
