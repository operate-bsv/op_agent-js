const { resolve } = require('path')
const Adapter = require(resolve('lib/operate/adapter'))
const Cache = require(resolve('lib/operate/cache'))

class TestAdapter extends Adapter {
  fetchTx(txid) {
    if (txid) {
      return Promise.resolve({ txid })
    } else {
      return Promise.reject(new Error('Test error'))
    }
  }

  fetchTxBy(query) {
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