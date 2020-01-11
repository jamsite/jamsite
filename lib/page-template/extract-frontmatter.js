const toml = require('toml')

const SEPARATOR = '---'
const EOLS = ['\n', '\r\n']

module.exports = function extractFrontmatter (data) {
  let rawFrontmatter = ''
  let template = data

  for (const eol of EOLS) {
    const separator = SEPARATOR + eol
    if (!data.startsWith(separator)) continue

    // second separator must start with newline character
    const secondSeparator = eol + separator
    const pos = data.indexOf(secondSeparator, separator.length - 1)

    if (pos === -1) {
      template = ''
      rawFrontmatter = data.substring(
        separator.length,
        data.endsWith(SEPARATOR)
          ? data.length - SEPARATOR.length
          : data.length
      )
    } else {
      rawFrontmatter = data.substring(separator.length, pos)
      template = data.substring(pos + secondSeparator.length, data.length)
    }

    break
  }

  const frontmatter = toml.parse(rawFrontmatter)
  return { frontmatter, template }
}
