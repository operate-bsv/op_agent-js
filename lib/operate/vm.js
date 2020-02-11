const { lua, lauxlib, lualib, to_luastring } = require('fengari')
const interop = require('fengari-interop')
const agentExtension = require('extension/agent')
const baseExtension = require('extension/base')
const contextExtension = require('extension/context')
const cryptoExtension = require('extension/crypto')
const jsonExtension = require('extension/json')

const extensions = [
  agentExtension,
  baseExtension,
  contextExtension,
  cryptoExtension,
  jsonExtension
]

class VM {

  constructor(agent) {
    this.agent = agent
    this._vm = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this._vm)
    interop.luaopen_js(this._vm)
    this.extend([config.extensions, ...extensions])
  }

  extend(extensions) {
    extensions.forEach(extension => {
      extension.extend(this)
    })
  }

  // Evaluates the given script within the VM state and returns the result.
  eval(code) {
    let status;
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();
    
    return this.decodedValue()
  }


  // Evaluates the given script within the VM state and returns the modified state.
  exec(code) {
    let status;
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();

    return this
  }


  // Calls a function within the VM state at the given lua path and returns the result.
  call(path, args = []) {
    if (typeof path === 'string') {
      return this.call(path.split('.'), args)
    }
    let status;
    path.forEach((p, i) => {
      let type;
      if (i === 0) {
        type = lua.lua_getglobal(this._vm, to_luastring(p))
      } else {
        type = lua.lua_getfield(this._vm, -1, to_luastring(p))
      }
      if (type <= 0) this._throwError();
    })
    args.forEach(a => interop.push(this._vm, a))
    status = lua.lua_pcall(this._vm, args.length, 1, 0)
    if (status !== 0) this._throwError();

    //const res = interop.tojs(this._vm, -1) //lua_toproxy(this._vm, -1) //
    //lua.lua_pop(this._vm, 1)
    return this.decodedValue()
  }


  // Executes the given function with the given arguments.
  //execFunction(fn, args = []) {
  //  // weirdness is that first arg needs to be split as "this" arg
  //  const head = args.shift()
  //  // fn.apply() returns single value / fn.invoke() returns array of values
  //  const res = fn.apply(head, args)
  //  return res.length === 1 ? res[0] : res
  //}


  decodedValue() {
    const res = interop.tojs(this._vm, -1) //lua_toproxy(this._vm, -1) //
    lua.lua_pop(this._vm, 1)

    return this._decode(res)
  }


  _decode(val) {
    if (Array.isArray(val) && val.length === 1) {
      return this._decode(val[0])
    } else if (typeof val === 'function') {
      const type = val.toString()
      if ( /^function/.test(type) ) {
        return (...args) => {
          const head = args.shift(),
                res = val.invoke(head, args);
          return this._decode(res)
        }
      }
      if ( /^table/.test(type) ) {
        const map = new Map()
        for (let [k, v] of val) {
          map.set(k, this._decode(v))
        }
        if ( Array.from(map.keys()).every(Number.isInteger) )
          return Array.from(map.values()).reverse();
        return map
      }
    } else {
      return val
    }
  }


  // Generic error handler
  _throwError() {
    const err = lua.lua_tojsstring(this._vm, -1)
    lua.lua_pop(this._vm, 1)
    throw new Error(`Lua Error: ${ err }`);
  }

}

module.exports = VM