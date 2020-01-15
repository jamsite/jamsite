const path = require('path')

module.exports.onBeforeLoadRes = async function onBeforeLoadRes (jamsite) {
  handlebarsHelpers(jamsite)
}

function handlebarsHelpers (jamsite) {
  let resolved
  try {
    resolved = require.resolve(
      path.join(jamsite.paths.modules, 'handlebars-helpers')
    )
  } catch (e) {
    return
  }

  const helpers = require(resolved)
  helpers({ handlebars: jamsite.handlebars })
}
