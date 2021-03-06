const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const Operate = require(resolve('lib/index'))
const Agent = require(resolve('lib/operate/agent'))
const Tape = require(resolve('lib/operate/tape'))
const Bob = require(resolve('lib/operate/adapter/bob'))
const util = require(resolve('lib/operate/util'))


before(() => {
  Operate.config.update({
    aliases: {
      '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': '6232de04',
      '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5': '1fec30d4',
      '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva': 'a3a83843'
    }
  })
})


describe('Operate.loadTape()', () => {
  before(() => {
    nock('https://media.bitcoinfiles.org/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/bitcoin_files_fetch_tx.txt', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/operate_load_tape_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and prepare valid tape', async () => {
    const tape = await Operate.loadTape('98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633')
    assert.instanceOf(tape, Tape)
    assert.isTrue(tape.isValid)
    assert.lengthOf(tape.cells, 3)
  })

  it('must load and run tape', async () => {
    const tape = await Operate.loadTape('98be5010028302399999bfba0612ee51ea272e7a0eb3b45b4b8bef85f5317633')
    const result = await Operate.runTape(tape)
    assert.equal(result.get('app'), 'twetch')
    assert.include([...result.keys()], '_MAP')
    assert.include([...result.keys()], '_AIP')
  })
})


describe('Operate.loadTape() using txid with output index', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/operate_load_tape_indexed.json', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/agent_local_tape_load_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and run the correct tape', async () => {
    const res1 = await Operate.loadTape('abcdef/1', { tape_adapter: Bob })
      .then(t => Operate.runTape(t))
      .then(r => util.mapToObject(r))
    const res2 = await Operate.loadTape('abcdef/2', { tape_adapter: Bob })
      .then(t => Operate.runTape(t))
      .then(r => util.mapToObject(r))

    assert.deepEqual(res1, {baz: 'qux'})
    assert.deepEqual(res2, {quux: 'garply'})
  })
})


describe('Operate.loadTapesBy()', () => {
  let query
  before(() => {
    query = {
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
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/bob_fetch_tx_by.json', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .times(6)
      .replyWithFile(200, 'test/mocks/operate_load_tape_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and prepare valid tapes', async () => {
    const tapes = await Operate.loadTapesBy(query, { tape_adapter: Bob })
    assert.lengthOf(tapes, 3)
    assert.isTrue(tapes.every(tape => tape.isValid))
    assert.lengthOf(tapes[0].cells, 1)
    assert.lengthOf(tapes[2].cells, 3)
  })

  it('must run all tapes', async () => {
    const tapes = await Operate.loadTapesBy(query, { tape_adapter: Bob })
    for (let i = 0; i < tapes.length; i++) {
      await Operate.runTape(tapes[i])
    }
    assert.lengthOf(tapes, 3)
    assert(tapes.every(t => !!t.result))
  })
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
