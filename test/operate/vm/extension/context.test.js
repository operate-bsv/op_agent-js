const { resolve } = require('path')
const VM = require(resolve('lib/operate/vm'))
const { assert } = require('chai')
const { _toBPU } = require(resolve('lib/operate/adapter/bob'))

let vm, vm2;
before(() => {
  vm = new VM()
  vm2 = new VM()
  const tx = require(resolve('test/mocks/bob_fetch_tx.json'))
  const bpu = _toBPU(tx)[0]

  vm.set('ctx.tx', bpu)
    .set('ctx.tape_index', 0)
    .set('ctx.cell_index', 2)
    .set('ctx.data_index', 7)
})


describe('ContextExt.txInput', () => {
  it('with state must return the input by index', () => {
    const res = vm.eval('return ctx.tx_input(0)')
    assert.deepEqual([...res.keys()], ['e', 'i', 'tape'])
    assert.deepEqual([...res.get('e').keys()], ['a', 'h', 'i'])
  })

  it('out of range must return nil', () => {
    const res = vm.eval('return ctx.tx_input(1000)')
    assert.isUndefined(res)
  })

  it('out of state must return nil', () => {
    const res = vm2.eval('return ctx.tx_input(1)')
    assert.isUndefined(res)
  })
})


describe('ContextExt.txOutput', () => {
  it('with state must return the output by index', () => {
    const res = vm.eval('return ctx.tx_output(1)')
    assert.deepEqual([...res.keys()], ['e', 'i', 'tape'])
    assert.deepEqual([...res.get('e').keys()], ['a', 'i', 'v'])
  })

  it('out of range must return nil', () => {
    const res = vm.eval('return ctx.tx_output(1000)')
    assert.isUndefined(res)
  })

  it('without state must return nil', () => {
    const res = vm2.eval('return ctx.tx_output(1)')
    assert.isUndefined(res)
  })
})


describe('ContextExt.getTape', () => {
  it('with state must return the current tape', () => {
    const res = vm.eval('return ctx.get_tape()')
    assert.lengthOf(res, 28)
  })

  it('without state must return nil', () => {
    const res = vm2.eval('return ctx.get_tape()')
    assert.isUndefined(res)
  })
})


describe('ContextExt.getCell', () => {
  it('without index must return the current cell', () => {
    const res = vm.eval('return ctx.get_cell()')
    assert.equal(res[0].get('b'), '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5')
    assert.equal(res.length, 16)
  })

  it('with index must return the requested cell', () => {
    const res = vm.eval('return ctx.get_cell(1)')
    assert.equal(res[0].get('b'), '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut')
    assert.equal(res.length, 5)
  })

  it('without state must return nil', () => {
    const res = vm2.eval('return ctx.get_cell()')
    assert.isUndefined(res)
  })
})