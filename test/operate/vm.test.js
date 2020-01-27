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


describe('VM#call()', () => {
  let vm;
  before(() => {
    vm = new VM()
  })
  
  it('must execute the script and return a value', () => {
    vm.exec("function main(a, b) return table.concat({a, b}, ' ') end")
    const res = vm.call('main', ['hello', 'world'])
    assert.equal(res, 'hello world')
  })

  it('must execute the named handler function', () => {
    vm.exec("m = {}; function m.test() return 32 / 6 end")
    const res = vm.call('m.test')
    assert.equal(res, 5.3333333333333333)
  })

  it('must return an error message when no script', () => {
    vm.exec("function foo() return 123 end")
    assert.throws(_ => vm.call('moo'), /^Lua Error/)
  })
})


describe('VM#execFunction()', () => {
  let vm;
  before(() => {
    vm = new VM()
  })

  it('must call the function and return a value', () => {
    const fn = vm.eval("return function(a,b) return a * b end")
    const res = fn(3,5)
    assert.equal(res, 15)
  })

  it('must be able to call nested functions in the returned result', () => {
    const script = `
    return function(a,b)
      local m = {
        'test',
        a = a,
        b = b
      }
      function m.sum()
        return m.a + m.b
      end
      function m.mul()
        return m.a * m.b
      end
      return m
    end
    `
    const fn = vm.eval(script)
    const res = fn(3,5)

    assert.equal(res.get('a'), 3)
    assert.equal(res.get('b'), 5)
    assert.equal(res.get('sum')(), 8)
    assert.equal(res.get('mul')(), 15)
  })
})