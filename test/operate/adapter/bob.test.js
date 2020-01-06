const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const Bob = require(resolve('lib/operate/adapter/bob'))


describe('Bob.fetchTx()', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/bob_fetch_tx.json', {
        'Content-Type': 'application/json',
      })
  })

  it('must fetch tx', async () => {
    const tx = await Bob.fetchTx('98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633', { apiKey: 'test' })
    assert.equal(tx.txid, '98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633')
    assert.lengthOf(tx.in, 1)
    assert.lengthOf(tx.out, 3)
    assert.lengthOf(tx.out[0].tape[1].cell, 5)
  })
})