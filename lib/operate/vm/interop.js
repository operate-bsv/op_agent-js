const { lua, lauxlib, lualib, to_luastring } = require('fengari')
const binary = require('bops')
const isUtf8 = require('isutf8')


/**
 * Proxy class for wrapping any arbitrary data/
 *
 * @class {JSProxy}
 */
class JSProxy {
  constructor(data) {
    this.data = data
  }
}


/**
 * Interop module to help encoding and decoding data to and from Lua/JavaScript.
 */
const interop = {

  /**
   * Wraps the given data so it will not be encoded for Lua.
   *
   * @param {any} data Any data
   * @return {JSProxy}
   */
  wrap(data) {
    return new JSProxy(data)
  },

  /**
   * Pushes the given data into the Lua VM, encoding into the appropriate type.
   *
   * @param {lua_State} vm Lua VM state
   * @param {any} val Any data object
   */
  push(vm, val) {
    switch (typeof val) {
      case 'undefined':
        lua.lua_pushnil(vm)
        break
      case 'boolean':
        lua.lua_pushboolean(vm, val)
        break
      case 'number':
        lua.lua_pushnumber(vm, val)
        break
      case 'string':
        lua.lua_pushstring(vm, to_luastring(val))
        break
      case 'symbol':
        lua.lua_pushlightuserdata(vm, val)
        break
      case 'function':
        lua.lua_pushjsfunction(vm, val)
        break
      case 'object':
      default:
        if (val === null) {
          lua.lua_pushnil(vm)
          break
        }
        if (binary.is(val)) {
          lua.lua_pushstring(vm, val)
          break
        }
        if (val instanceof JSProxy) {
          const d = lua.lua_newuserdata(vm)
          d.data = val.data
          break
        }
        this.pushTable(vm, val)
        break
    }
  },

  /**
   * Pushes the given Array, Map or Object into the Lua VM, encoded as a lua Table.
   *
   * @param {lua_State} vm Lua VM state
   * @param {Array|Map|Object} val Data object
   */
  pushTable(vm, val) {
    lua.lua_createtable(vm, 0, 0)
    const top = lua.lua_gettop(vm)

    if (Array.isArray(val)) {
      val.forEach((v, i) => {
        this.pushTableField(vm, i+1, v)
        lua.lua_settop(vm, top)
      })
    }
    else if (val instanceof Map) {
      for (let [k, v] of val) {
        this.pushTableField(vm, k, v)
        lua.lua_settop(vm, top)
      }
    }
    else {
      for (let k in val) {
        this.pushTableField(vm, k, val[k])
        lua.lua_settop(vm, top)
      }
    }
  },

  /**
   * Pushes the given data into the Lua VM as a table field at the given path.
   *
   * @param {lua_State} vm Lua VM state
   * @param {String} key Table field name
   * @param {any} val Any data object
   */
  pushTableField(vm, key, val) {
    this.push(vm, val)
    if (Number.isInteger(key)) {
      lua.lua_seti(vm, -2, key)
    } else {
      lua.lua_setfield(vm, -2, to_luastring(key))
    }
  },

  /**
   * Gets the data from the Lua VM stack at the given index, and returns a
   * decoded JavaScript object.
   *
   * @param {lua_State} vm Lua VM state
   * @param {Integer} i Lua stack index
   * @return {any}
   */
  tojs(vm, i) {
    const type = lua.lua_type(vm, i)
    switch(type) {
      case lua.LUA_TNONE:                 // -1
      case lua.LUA_TNIL:                  // 0
        return void 0;
      case lua.LUA_TBOOLEAN:              // 1
        return lua.lua_toboolean(vm, i)
      case lua.LUA_TLIGHTUSERDATA:        // 2
        return lua.lua_touserdata(vm, i)
      case lua.LUA_TNUMBER:               // 3
        return lua.lua_tonumber(vm, i)
      case lua.LUA_TSTRING:               // 4
        const str = lua.lua_tolstring(vm, i),
              buf = binary.from(str);
        return isUtf8(buf) ? binary.to(buf) : buf;
      case lua.LUA_TTABLE:                // 5
        return this.toMap(vm, lua.lua_toproxy(vm, i))
      case lua.LUA_TFUNCTION:             // 6
        return this.toFunction(vm, lua.lua_toproxy(vm, i))
      case lua.LUA_TUSERDATA:             // 7
        let u = lua.lua_touserdata(vm, i)
        return u ? u.data : void 0;
      case lua.LUA_TTHREAD:               // 8
      /* fall through */
      default:
        return lua.lua_toproxy(vm, i)
    }
  },

  /**
   * Converts the given Lua proxy into a JavaScript Map.
   *
   * @param {lua_State} vm Lua VM state
   * @param proxy Lua proxy object
   * @return {Map}
   */
  toMap(vm, proxy) {
    // get main thread
    lua.lua_rawgeti(vm, lua.LUA_REGISTRYINDEX, lua.LUA_RIDX_MAINTHREAD)
    const L = lua.lua_tothread(vm, -1)
    lua.lua_pop(vm, 1)

    const js = {}
    if (typeof Symbol === 'function') {
      js[Symbol.iterator] = _ => jsiterator(L, proxy)
    }

    // Build map
    const map = new Map()
    for (let [k, v] of js) {
      map.set(k, v)
    }

    // Convert to array if all keys are integers
    if ( Array.from(map.keys()).every(Number.isInteger) ) {
      return Array.from(map.keys()).sort().map(k => map.get(k))
    }

    return map
  },

  /**
   * Converts the given Lua proxy into a JavaScript Function.
   *
   * @param {lua_State} vm Lua VM state
   * @param proxy Lua proxy object
   * @return {Function}
   */
  toFunction(vm, proxy) {
    // get main thread
    lua.lua_rawgeti(vm, lua.LUA_REGISTRYINDEX, lua.LUA_RIDX_MAINTHREAD)
    const L = lua.lua_tothread(vm, -1)
    lua.lua_pop(vm, 1)

    const invoke = (args, nresults = 1) => {
      lauxlib.luaL_checkstack(L, args.length, null)
      const base = lua.lua_gettop(L)
      proxy(L)
      args.forEach(a => this.push(L, a))
      switch(lua.lua_pcall(L, args.length, nresults, 0)) {
        case lua.LUA_OK:
          let nres = lua.lua_gettop(L)-base
          let res = new Array(Math.max(0, nres))
          for (let i = 0; i < nres; i++) {
            res[i] = this.tojs(L, base+i+1)
          }
          lua.lua_settop(L, base);
          return res
        default: {
          let r = this.tojs(L, -1)
          lua.lua_settop(L, base)
          throw r
        }
      }
    }

    const func = (...args) => invoke(args)[0]
    func.invoke = (...args) => invoke(args, lua.LUA_MULTRET)
    return func
  }
}

/**
 * The following functions are extracted from fengari-interop
 * https://github.com/fengari-lua/fengari-interop
 * - jsiterator()
 * - iter_next()
 * @copyright Copyright (c) 2017-2019 Daurnimator
 */

/* make iteration use pairs() */
const jsiterator = function(L, p) {
  lauxlib.luaL_checkstack(L, 1, null);
  lua.lua_pushcfunction(L, function(L) {
    lauxlib.luaL_requiref(L, to_luastring("_G"), lualib.luaopen_base, 0);
    lua.lua_getfield(L, -1, to_luastring("pairs"));
    p(L);
    lua.lua_call(L, 1, 3);
    return 3;
  });
  switch(lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0)) {
    case lua.LUA_OK: {
      let iter = lua.lua_toproxy(L, -3);
      let state = lua.lua_toproxy(L, -2);
      let last = lua.lua_toproxy(L, -1);
      lua.lua_pop(L, 3);
      return {
        L: L,
        iter: iter,
        state: state,
        last: last,
        next: iter_next
      };
    }
    default: {
      let r = interop.tojs(L, -1);
      lua.lua_pop(L, 1);
      throw r;
    }
  }
};


/* implements lua's "Generic For" protocol */
const iter_next = function() {
  let L = this.L;
  lauxlib.luaL_checkstack(L, 3, null);
  let top = lua.lua_gettop(L);
  this.iter(L);
  this.state(L);
  this.last(L);
  switch(lua.lua_pcall(L, 2, lua.LUA_MULTRET, 0)) {
    case lua.LUA_OK: {
      this.last = lua.lua_toproxy(L, top+1);
      let r;
      if (lua.lua_isnil(L, -1)) {
        r = {
          done: true,
          value: void 0
        };
      } else {
        let n_results = lua.lua_gettop(L) - top;
        let result = new Array(n_results);
        for (let i=0; i<n_results; i++) {
          result[i] = interop.tojs(L, top+i+1);
        }
        r = {
          done: false,
          value: result
        };
      }
      lua.lua_settop(L, top);
      return r;
    }
    default: {
      let e = interop.tojs(L, -1);
      lua.lua_pop(L, 1);
      throw e;
    }
  }
};

module.exports = interop