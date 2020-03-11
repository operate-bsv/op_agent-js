const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const VM = require(resolve('lib/operate/vm'))
const Agent = require(resolve('lib/operate/agent'))
const Cell = require(resolve('lib/operate/cell'))
const util = require(resolve('lib/operate/util'))

let agent, vm;
before(() => {
  const aliases = {
    '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': '6232de04',
    '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5': '1fec30d4',
    '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva': 'a3a83843'
  }
  agent = new Agent({ aliases })
  vm = new VM({ agent })
})


describe('AgentExt.loadTape, AgentExt.runTape', () => {
  before(() => {
    nock('https://bob.planaria.network/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/agent_exec_get_tape.json', {
        'Content-Type': 'application/json'
      })
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .twice()
      .replyWithFile(200, 'test/mocks/agent_exec_get_ops.json', {
        'Content-Type': 'application/json'
      })
  })

  it('must load and run and return value of given tape', async () => {
    const res = await vm.eval(`
      return function()
        local tape = agent.load_tape('65aa086b2c54d5d792973db425b70712a708a115cd71fb67bd780e8ad9513ac9')
        return agent.run_tape(tape)
      end`)()
    assert.include([...res.keys()], 'name')
    assert.include([...res.keys()], 'numbers')
  })

  it('must build on the given state', async () => {
    const res = await vm.eval(`
      return function()
        local tape = agent.load_tape('65aa086b2c54d5d792973db425b70712a708a115cd71fb67bd780e8ad9513ac9')
        return agent.run_tape(tape, {state = {'testing'}})
      end`)()
    assert.include(res.get('numbers'), 'testing')
  })
})


describe('AgentExt.loadTape, AgentExt.runTape', () => {
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

  it('must load and run tapes from a given query', async () => {
    const fn = vm.eval(`
      return function()
        local query = { find = {}, limit = 3 }
        query.find['out.tape.cell'] = {}
        query.find['out.tape.cell']['$elemMatch'] = {
          i = 0,
          s = '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5'
        }
        local opts = {
          tape_adapter = {
            'Operate.Adapter.Bob',
            {api_key = 'foo'}
          }
        }
        local tapes = agent.load_tapes_by(query, opts)
        local results = {}
        for i, tape in ipairs(tapes) do
          local res = agent.run_tape(tape)
          table.insert(results, res)
        end
        return results
      end`)
    const res = await fn.invokeAsync(),
          apps = res.map(r => r.get('app'));
    assert.deepEqual(apps, ['tonicpow', 'twetch', 'twetch'])
  })
})


describe('AgentExt.loadTape, AgentExt.runTape', () => {
  let tape;
  before(async () => {
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .thrice()
      .replyWithFile(200, 'test/mocks/agent_local_tape_load_ops.json', {
        'Content-Type': 'application/json'
      })

    const script = `
      return function(state)
        local t1 = agent.local_tape(1)
        local t2 = agent.local_tape(2)
        return {
          foo = agent.run_tape(t1),
          bar = agent.run_tape(t2)
        }
      end`

    const tx = require(resolve('test/mocks/operate_load_tape_indexed.json')).u[0]
    tape = await agent._prepTape(tx, 0)
    tape.cells = [
      new Cell({ ref: 'test', op: script, index: 0, dataIndex: 1 })
    ]
  })

  it('must get and run tapes from local context', async () => {
    let res = await agent.runTape(tape)
    res = util.mapToObject(res)
    assert.deepEqual(res.foo, { baz: 'qux' })
    assert.deepEqual(res.bar, { quux: 'garply' })
  })
})