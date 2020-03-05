const { resolve } = require('path')
const VM = require(resolve('lib/operate/vm'))
const nock = require('nock')
const { assert } = require('chai')
const Agent = require(resolve('lib/operate/agent'))

let aliases
before(() => {
  aliases = {
    '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': '6232de04',
    '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5': '1fec30d4',
    '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva': 'a3a83843'
  }
})


describe('AgentExt.loadTape, AgentExt.runTape', () => {
  let vm;
  before(() => {
    vm = new VM({ agent: new Agent() })
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
    const res = await vm.evalAsync(`
      local tape = agent.load_tape('65aa086b2c54d5d792973db425b70712a708a115cd71fb67bd780e8ad9513ac9')
      return agent.run_tape(tape)`
    )
    assert.include([...res.keys()], 'name')
    assert.include([...res.keys()], 'numbers')
  })

  it('must build on the given state', async () => {
    const res = await vm.evalAsync(`
      local tape = agent.load_tape('65aa086b2c54d5d792973db425b70712a708a115cd71fb67bd780e8ad9513ac9')
      return agent.run_tape(tape, {state = {'testing'}})`
    )
    assert.include(res.get('numbers'), 'testing')
  })
})
