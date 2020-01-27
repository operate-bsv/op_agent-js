const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const Operate = require(resolve('lib/index'))
const Agent = require(resolve('lib/operate/agent'))
const Tape = require(resolve('lib/operate/tape'))

let aliases
before(() => {
  aliases = {
    '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': '6232de04',
    '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5': '1fec30d4',
    '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva': 'a3a83843'
  }
})

describe('Operate.loadTape()', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/bob_fetch_tx.json', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/operate_load_tape_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and prepare valid tape', async () => {
    const tape = await Operate.loadTape(
      '98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633',
      { aliases }
    )
    assert.instanceOf(tape, Tape)
    assert.isTrue(tape.isValid)
    assert.lengthOf(tape.cells, 3)
  })

  xit('must load and run tape')
})


describe('Operate.loadTapesBy()', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/bob_fetch_tx_by.json', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .thrice()
      .replyWithFile(200, 'test/mocks/operate_load_tape_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and prepare valid tapes', async () => {
    const query = {
      find: {
        'out.tape.cell': {
          $elemMatch: {
            i: 0,
            s: '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5'
          }
        }
      },
      limit: 3
    }
    const tapes = await Operate.loadTapesBy(query, { aliases })
    assert.lengthOf(tapes, 3)
    assert.isTrue(tapes.every(tape => tape.isValid))
    assert.lengthOf(tapes[0].cells, 1)
    assert.lengthOf(tapes[2].cells, 3)
  })

  xit('must run all tapes')
})


describe('Operate.Agent', () => {
  it('must instantiate a new agent', () => {
    const agent = new Operate.Agent()
    assert.instanceOf(agent, Agent)
  })

  it('must set given config on agent', () => {
    const agent = new Operate.Agent({ aliases: { foo: 'bar' } })
    assert.deepEqual(agent.config.aliases, { foo: 'bar' })
  })
})