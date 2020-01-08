const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))

describe('VM#eval()', () => {
  let vm;
  before(() => {
    vm = new VM()
  })
  
  it('must evaluate the script and return a value', () => {
    const res = vm.eval("return table.concat({'hello', 'world'}, ' ')")
    assert.equal(res, 'hello world')
  })

  it('must evaluate the script and return an error message', () => {
    assert.throws(_ => vm.eval("return 'test' {& 'invalid'"), /^Lua Error/)
  })
})