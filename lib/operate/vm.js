const { lua, lauxlib, lualib, to_luastring } = require('fengari')
const interop = require('fengari-interop')

class VM {

  constructor() {
    this._vm = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this._vm)
  }


  eval(code) {
    let status;
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();
    
    const res = interop.tojs(this._vm, -1)
    lua.lua_pop(this._vm, 1)
    return res
  }


  // Generic error handler
  _throwError() {
    const err = lua.lua_tojsstring(this._vm, -1)
    lua.lua_pop(this._vm, 1)
    throw new Error(`Lua Error: ${ err }`);
  }

}

module.exports = VM