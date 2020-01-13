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
    const adapter = new Bob({ apiKey: 'test' })
    const tx = await adapter.fetchTx('98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633')
    assert.equal(tx.txid, '98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633')
    assert.lengthOf(tx.in, 1)
    assert.lengthOf(tx.out, 3)
    assert.lengthOf(tx.out[0].tape[1].cell, 5)
  })
})

describe('Bob.fetchTxBy()', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/bob_fetch_tx_by.json', {
        'Content-Type': 'application/json',
      })
  })

  it('must fetch tx', async () => {
    const query = {
      "find":{
        "out.tape.cell": {
          "$elemMatch": {
            "i": 0,
            "s": "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5"
          }
        }
      },
      "limit": 3
    }
    const adapter = new Bob({ apiKey: 'test' })
    const txns = await adapter.fetchTxBy(query)
    const confirmed = txns.filter(tx => tx.blk)

    assert.lengthOf(confirmed, 3)
    assert.deepEqual(confirmed.map(tx => tx.txid), [
      "8f6628e6c942ba140e3f0b6e296df0e66a2da1f2bf6ab0671840924a6a31289f",
      "301453862873865821ac93ed67cf62f9f0c8ef1e7372ac009afb8419fad7e713",
      "b2294f24f60f3a4ec90cbce12d6b2ee3582501ab6e5ddf78b060874f3e809bc6"
    ])
  })
})