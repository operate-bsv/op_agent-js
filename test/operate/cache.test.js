const { resolve } = require('path')
const { assert } = chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { TestAdapter, TestCache } = require(resolve('test/test_helper'))

chai.use(chaiAsPromised)


describe('Cache.fetchTx()', () => {
  it('must return a result', async () => {
    tx = await TestCache.fetchTx("abc", {}, [TestAdapter, {}])
    assert.equal(tx.txid, 'abc')
  })

  it('must throw an error', () => {
    assert.isRejected(TestCache.fetchTx(null, {}, [TestAdapter, {}]), 'Test error')
  })
})


describe('Cache.fetchTxBy()', () => {
  it('must return a result', async () => {
    txs = await TestCache.fetchTxBy({find: 'foo'}, {}, [TestAdapter, {}])
    assert.lengthOf(txs, 1)
    assert.equal(txs[0].txid, 'abcdef')
  })

  it('must throw an error', () => {
    assert.isRejected(TestCache.fetchTxBy(null, {}, [TestAdapter, {}]), 'Test error')
  })
})