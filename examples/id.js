const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../')

;(async () => {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))
  const info = await node.id()
  console.log(info)
})()