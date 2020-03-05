const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))

let vm
before(() => {
  vm = new VM()
})

describe('BaseExt.encode16, BaseExt.decode16', () => {  
  it('must encode binary string as hex string', () => {
    assert.equal(vm.eval(`return base.encode16('foo bar')`), '666f6f20626172')
  })

  it('must encode hex string as binary string', () => {
    assert.equal(vm.eval(`return base.decode16('666f6f20626172')`), 'foo bar')
    // With mixed casings
    assert.equal(vm.eval(`return base.decode16('666F6F20626172')`), 'foo bar')
    assert.equal(vm.eval(`return base.decode16('666F6f20626172')`), 'foo bar')
  })
})


describe('BaseExt.encode64, BaseExt.decode64', () => {
  it('must encode binary string as hex string', () => {
    assert.equal(vm.eval(`return base.encode64('foo bar')`), 'Zm9vIGJhcg==')
  })

  it('must encode hex string as binary string', () => {
    assert.equal(vm.eval(`return base.decode64('Zm9vIGJhcg==')`), 'foo bar')
  })
})
