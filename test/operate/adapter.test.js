const { resolve } = require('path')
const { assert } = chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { TestAdapter } = require(resolve('test/test_helper'))

chai.use(chaiAsPromised)


describe('Adapter.fetchTx()', () => {
  it('must return a result', async () => {
    tx = await TestAdapter.fetchTx("abc")
    assert.equal(tx.txid, 'abc')
  })

  it('must throw an error', () => {
    assert.isRejected(TestAdapter.fetchTx(null), 'Test error')
  })
})


describe('Adapter.fetchTxBy()', () => {
  it('must return a result', async () => {
    txs = await TestAdapter.fetchTxBy({find: 'foo'})
    assert.lengthOf(txs, 1)
    assert.equal(txs[0].txid, 'abcdef')
  })

  it('must throw an error', () => {
    assert.isRejected(TestAdapter.fetchTxBy(null), 'Test error')
  })
})