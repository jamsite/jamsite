const test = require('ava')
const extractFrontmatter = require('../lib/extract-frontmatter')

test('empty data', (t) => {
  const {
    frontmatter,
    template
  } = extractFrontmatter('')

  t.deepEqual(frontmatter, {})
  t.is(template, '')
})

test('empty frontmatter', (t) => {
  const {
    frontmatter,
    template
  } = extractFrontmatter('---\n---')

  t.deepEqual(frontmatter, {})
  t.is(template, '')
})

test('no frontmatter', (t) => {
  const data = 'line1\nline2'
  const {
    frontmatter,
    template
  } = extractFrontmatter(data)

  t.deepEqual(frontmatter, {})
  t.is(template, data)
})

test('only frontmatter', (t) => {
  const fixtures = [
    '---\nkey = "value"',
    '---\nkey = "value"\n',
    '---\nkey = "value"\n---',
    '---\nkey = "value"\n---\n'
  ]

  fixtures.forEach((data) => {
    const {
      frontmatter,
      template
    } = extractFrontmatter(data)

    t.deepEqual(frontmatter, { key: 'value' })
    t.is(template, '')
  })
})

test('frontmatter and template', (t) => {
  const expectedTemplate = 'line1\nline2\n'
  const expectedFrontmatter = { key: 'value' }

  const fixtures = [
    `---\nkey = "value"\n---\n${expectedTemplate}`,
    `---\r\nkey = "value"\r\n---\r\n${expectedTemplate}`
  ]

  fixtures.forEach((data) => {
    const {
      frontmatter,
      template
    } = extractFrontmatter(data)

    t.deepEqual(frontmatter, expectedFrontmatter)
    t.is(template, expectedTemplate)
  })
})

test('broken toml', (t) => {
  t.throws(() => extractFrontmatter('---\nkey = value'))
})
