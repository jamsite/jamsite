const path = require('path')
const serve = require('serve-handler')

module.exports = function getStaticHandler (jamsite) {
  const serveConfig = {
    public: path.join(jamsite.paths.root, 'public'),
    cleanUrls: false,
    symlinks: false
  }

  return (req, res) => serve(req, res, serveConfig)
}
