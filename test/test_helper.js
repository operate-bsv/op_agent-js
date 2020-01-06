const { resolve } = require('path')
const Adapter = require(resolve('lib/operate/adapter'))
const Cache = require(resolve('lib/operate/cache'))

class TestAdapter extends Adapter {
  static fetchTx(txid, opts = {}) {
    if (txid) {
      return Promise.resolve({ txid })
    } else {
      return Promise.reject(new Error('Test error'))
    }
  }

  static fetchTxBy(query, opts = {}) {
    if (query) {
      return Promise.resolve([{ txid: 'abcdef' }])
    } else {
      return Promise.reject(new Error('Test error'))
    }
  }
}


class TestCache extends Cache {}

module.exports = {
  TestAdapter,
  TestCache
}