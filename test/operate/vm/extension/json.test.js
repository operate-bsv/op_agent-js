const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))

let vm;
before(() => {
  vm = new VM()
})


describe('JsonExt.encode()', () => {
  it('must encode values as JSON strings', () => {
    assert.equal(vm.eval("return json.encode('foo bar')"), "\"foo bar\"")
    assert.equal(vm.eval("return json.encode(123)"), "123")
    assert.equal(vm.eval("return json.encode({'foo', 'bar'})"), "[\"foo\",\"bar\"]")
    assert.equal(vm.eval("return json.encode({foo = 'bar'})"), "{\"foo\":\"bar\"}")
    assert.equal(vm.eval("return json.encode({foo = 'bar', 'baz'})"), "{\"1\":\"baz\",\"foo\":\"bar\"}")
  })

  it('must encode complex values as JSON strings', () => {
    const res = vm.eval(`
    return json.encode({
      foo = 'bar',
      baz = { 'a', 'b', 'c' },
      qux = {
        bish = 'bash'
      }
    })
    `)
    assert.typeOf(res, 'string')
    const obj = JSON.parse(res)
    assert.equal(obj.foo, 'bar')
    assert.deepEqual(obj.baz, ['a', 'b', 'c'])
    assert.equal(obj.qux.bish, 'bash')
  })
})


describe('JsonExt.decode()', () => {
  it('must decode JSON strings as Lua types', () => {
    assert.isTrue(vm.eval("return json.decode('\"foo bar\"') == 'foo bar'"))
    assert.isTrue(vm.eval("return json.decode(123) == 123"))
    assert.isTrue(vm.eval("tab = json.decode('[\"foo\",\"bar\"]'); return tab[1] == 'foo' and tab[2] == 'bar'"))
    assert.isTrue(vm.eval("tab = json.decode('{\"foo\":\"bar\"}'); return tab.foo == 'bar'"))
    assert.isTrue(vm.eval("tab = json.decode('{\"1\":\"baz\",\"foo\":\"bar\"}'); return tab['1'] == 'baz'"))
  })
})