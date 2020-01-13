const { resolve } = require('path')
const { assert } = chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { TestAdapter, TestCache } = require(resolve('test/test_helper'))

chai.use(chaiAsPromised)


describe('Cache.fetchTx()', () => {
  it('must return a result', async () => {
    const adapter = new TestAdapter()
    const cache = new TestCache()
    tx = await cache.fetchTx("abc", adapter)
    assert.equal(tx.txid, 'abc')
  })

  it('must throw an error', () => {
    const adapter = new TestAdapter()
    const cache = new TestCache()
    assert.isRejected(cache.fetchTx(null, adapter), 'Test error')
  })
})


describe('Cache.fetchTxBy()', () => {
  it('must return a result', async () => {
    const adapter = new TestAdapter()
    const cache = new TestCache()
    txs = await cache.fetchTxBy({find: 'foo'}, adapter)
    assert.lengthOf(txs, 1)
    assert.equal(txs[0].txid, 'abcdef')
  })

  it('must throw an error', () => {
    const adapter = new TestAdapter()
    const cache = new TestCache()
    assert.isRejected(cache.fetchTxBy(null, adapter), 'Test error')
  })
})