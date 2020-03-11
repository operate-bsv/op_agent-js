const { resolve } = require('path')
const { assert } = require('chai')
const { lua, to_luastring } = require('fengari')
const VM = require(resolve('lib/operate/vm'))
const interop = require(resolve('lib/operate/vm/interop'))


let vm
beforeEach(() => {
  vm = new VM()
})


describe('interop.push()', () => {
  it('must push undefined', () => {
    interop.push(vm._vm, undefined)
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test == nil"))
  })

  it('must push a boolean', () => {
    interop.push(vm._vm, true)
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test == true"))
  })

  it('must push a number', () => {
    interop.push(vm._vm, 123)
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test == 123"))
  })

  it('must push a string', () => {
    interop.push(vm._vm, 'hello world')
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test == 'hello world'"))
  })

  it('must push a binary string', () => {
    interop.push(vm._vm, Buffer.from('hello world'))
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test == 'hello world'"))
  })

  it('must push a function', () => {
    interop.push(vm._vm, function(vm) {
      const arg = lua.lua_tonumber(vm, 1),
            res = arg * arg;
      lua.lua_pushnumber(vm, res)
      return 1
    })
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test(4) == 16"))
  })

  it('must push an array', () => {
    interop.push(vm._vm, ['foo', 'bar'])
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test[1] == 'foo'"))
    assert.isTrue(vm.eval("return test[2] == 'bar'"))
  })

  it('must push a map', () => {
    interop.push(vm._vm, new Map([
      ['foo', 'bar'],
      [1, 'baz'],
      ['qux', new Map([
        ['bish', 'bash']
      ])]
    ]))
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test[1] == 'baz'"))
    assert.isTrue(vm.eval("return test.foo == 'bar'"))
    assert.isTrue(vm.eval("return test.qux.bish == 'bash'"))
  })

  it('must push an object', () => {
    interop.push(vm._vm, {
      foo: 'bar',
      1: 'baz',
      qux: {
        bish: 'bash'
      }
    })
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    assert.isTrue(vm.eval("return test['1'] == 'baz'"))
    assert.isTrue(vm.eval("return test.foo == 'bar'"))
    assert.isTrue(vm.eval("return test.qux.bish == 'bash'"))
  })
})


describe('interop.tojs()', () => {
  it('must pull null', () => {
    vm.exec("return nil")
    assert.equal(interop.tojs(vm._vm, -1), null)
    vm.exec("return flop")
    assert.equal(interop.tojs(vm._vm, -1), null)
  })

  it('must pull boolean', () => {
    vm.exec("return true")
    assert.equal(interop.tojs(vm._vm, -1), true)
  })

  it('must pull number', () => {
    vm.exec("return 12.53624")
    assert.equal(interop.tojs(vm._vm, -1), 12.53624)
  })

  it('must pull string', () => {
    vm.exec("return 'hello world'")
    assert.equal(interop.tojs(vm._vm, -1), 'hello world')
  })

  it('must pull binary string', () => {
    interop.push(vm._vm, Buffer.from('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed', 'hex'))
    lua.lua_setglobal(vm._vm, to_luastring('test'))
    vm.exec("return test")
    const res = interop.tojs(vm._vm, -1)
    assert.instanceOf(res, Buffer)
    assert.lengthOf(res, 20)
    assert.equal(res.toString('hex'), '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed')
  })

  it('must pull simple table', () => {
    vm.exec("return { foo = 'bar' }")
    const res = interop.tojs(vm._vm, -1)
    assert.instanceOf(res, Map)
    assert.equal(res.get('foo'), 'bar')
  })

  it('must pull indexed table', () => {
    vm.exec("return { 'foo', 'bar' }")
    const res = interop.tojs(vm._vm, -1)
    assert.deepEqual(res, ['foo', 'bar'])
  })

  it('must pull complex table 1', () => {
    vm.exec(`
    return {
      foo = 'bar',
      'baz',
      qux = {
        bish = 'bash'
      }
    }
    `)
    const res = interop.tojs(vm._vm, -1)
    assert.instanceOf(res, Map)
    assert.equal(res.get(1), 'baz')
    assert.equal(res.get('foo'), 'bar')
    assert.equal(res.get('qux').get('bish'), 'bash')
  })

  it('must pull complex table 2', () => {
    vm.exec(`
    return {
      'foo',
      'bar',
      { bish = 'bash' }
    }
    `)
    const res = interop.tojs(vm._vm, -1)
    assert.equal(res[0], 'foo')
    assert.equal(res[1], 'bar')
    assert.equal(res[2].get('bish'), 'bash')
  })

  it('must pull a function', async () => {
    vm.exec(`
    return function(a, b)
      return a * b
    end
    `)
    const func = interop.tojs(vm._vm, -1)
    assert.instanceOf(func(3, 5), Promise)
    assert.equal(await func(3, 5), 15)
    assert.equal(func.invoke(3, 5), 15)
    assert.equal(await func.invokeAsync(3, 5), 15)
  })

  it('must pull a function with multiple returns', async () => {
    vm.exec(`
    return function(a, b)
      local res = a * b
      return res, 'foo bar'
    end
    `)
    const func = interop.tojs(vm._vm, -1)
    assert.instanceOf(func(3, 5), Promise)
    assert.deepEqual(await func(3, 5), [15, 'foo bar'])
    assert.deepEqual(func.invoke(3, 5), [15, 'foo bar'])
    assert.deepEqual(await func.invokeAsync(3, 5), [15, 'foo bar'])
  })
})