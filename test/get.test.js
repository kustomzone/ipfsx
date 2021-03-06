const test = require('ava')
const { randomBytes } = require('crypto')
const AbortController = require('abort-controller')
const ipfsx = require('./helpers/ipfsx')
const { randomInteger } = require('./helpers/random')

test.before(async t => { t.context.node = await ipfsx() })
test.after.always(t => t.context.node.stop())

test('should get directory', async t => {
  const { node } = t.context

  const { cid } = await node.add([
    { path: `ipfsx/A`, content: randomBytes(randomInteger(1, 256)) },
    { path: 'ipfsx/B', content: randomBytes(randomInteger(1, 256)) }
  ]).last()

  for await (const file of node.get(cid)) {
    // Directory has no content
    if (!file.content) continue

    let data = Buffer.alloc(0)

    for await (const chunk of file.content) {
      data = Buffer.concat([data, chunk])
    }
  }

  // TODO: FIX UP THE TEST
  t.pass()
})

test('should abort get', async t => {
  const { node } = t.context
  const input = randomBytes(randomInteger(1, 256))
  const { cid } = await node.add(input).first()

  const controller = new AbortController()
  const signal = controller.signal

  setTimeout(() => controller.abort())

  try {
    for await (const _ of node.get(cid, { signal })) { // eslint-disable-line
      t.fail()
    }
  } catch (err) {
    return t.is(err.message, 'operation aborted')
  }

  t.fail()
})
