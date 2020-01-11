const test = require('ava')
const objectGet = require('../../lib/page-template/object-get')

test('supports handlebars dot-path style', (t) => {
  const obj = {
    arr1: [
      [null, { key: 'value' }]
    ]
  }
  const result = objectGet(obj, 'arr1.[0].[1].key')
  t.is(result, 'value')
})
