const toIterator = require('pull-stream-to-async-iterator')

module.exports = backend => {
  return function get (path, options) {
    const abort = new Promise((resolve, reject) => {
      if (options && options.signal) {
        options.signal.onabort = () => reject(new Error('operation aborted'))
      }
    })

    return (async function * () {
      const it = toIterator(backend.files.getPullStream(path))
      while (true) {
        const { value, done } = await Promise.race([it.next(), abort])
        if (done) return
        value.content = value.content ? toIterator(value.content) : null
        yield value
      }
    })()
  }
}
