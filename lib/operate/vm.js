const { lua, lauxlib, lualib, to_luastring } = require('fengari')
const interop = require('./vm/interop')

const defaultExtensions = [
  require('./vm/extension/agent'),
  require('./vm/extension/base'),
  require('./vm/extension/context'),
  require('./vm/extension/crypto'),
  require('./vm/extension/json')
]

/**
 * Operate VM module. Responsible for initalizing the VM state and evaluating
 * and executing Lua code in the VM.
 *
 * @class VM
 */
class VM {
  /**
   * Initliazes a new VM state.
   *
   * @return {VM}
   */
  constructor(opts = {}) {
    const extensions = opts.extensions || []
    this.agent = opts.agent
    this._vm = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this._vm)
    defaultExtensions.concat(extensions)
      .forEach(ext => this.extend(ext))
  }

  /**
   * Extends the VM state with the given module or modules.
   *
   * @param {Extension|Array} extension Extension class or array
   * @return {VM}
   */
  extend(extension) {
    if (Array.isArray(extension)) {
      extension.forEach(ext => this.extend(ext))
    }

    extension.extend(this)
    return this
  }

  /**
   * Returns the value from the specified path on the VM state.
   *
   * @param {String|Array} path Lua path
   * @return {String|Number|Object|Array|Function}
   */
  get(path, opts = {}) {
    if (typeof path === 'string') {
      return this.get(path.split('.'), opts)
    }
    path.forEach((p, i) => {
      let type
      if (i === 0) {
        type = lua.lua_getglobal(this._vm, to_luastring(p))
      } else {
        type = lua.lua_getfield(this._vm, -1, to_luastring(p))
      }
      if (type < 0) this._throwError();
    })

    return interop.tojs(this._vm, -1)
  }

  /**
   * Sets the value at the specified path on the VM state.
   *
   * @param {String|Array} path Lua path
   * @param {String|Number|Object|Array} value Value
   * @param {Object} opts Options
   * @return {VM}
   */
  set(path, value, opts = {}) {
    if (opts.force) return this.setDeep(path, value)

    if (typeof path === 'string') {
      return this.set(path.split('.'), value)
    }

    path.forEach((p, i) => {
      let type

      if (i === path.length-1) {
        if (value && typeof value === 'object' && Object.keys(value).length === 0) {
          lua.lua_createtable(this._vm, 0, 0)
        } else {
          interop.push(this._vm, value)
        }
      }

      if (i === 0) {
        if (path.length === 1) {
          lua.lua_setglobal(this._vm, to_luastring(p))
        } else {
          type = lua.lua_getglobal(this._vm, to_luastring(p))
        }
      } else {
        if (i === path.length-1) {
          lua.lua_setfield(this._vm, -2, to_luastring(p))
        } else {
          type = lua.lua_getfield(this._vm, -1, to_luastring(p))
        }
      }

      if (i < path.length-1 && (![5,7].includes(type))) {
        throw new Error('Invalid Lua path.')
      } else if (type <= 0) {
        this._throwError()
      }
    })

    lua.lua_settop(this._vm, 0)
    return this
  }

  /**
   * Sets the value at the specified deeply nested path on the VM state.
   *
   * @param {String|Array} path Lua path
   * @param {String|Number|Object|Array} value Value
   * @return {VM}
   */
  setDeep(path, value) {
    if (typeof path === 'string') {
      return this.setDeep(path.split('.'), value)
    }

    for (const [i, p] of path.entries()) {
      let type

      if (i === path.length-1) {
        return this.set(path, value)
      }
      lua.lua_createtable(this._vm, 0, 0)
      if (i === 0) {
        lua.lua_setglobal(this._vm, to_luastring(p))
        type = lua.lua_getglobal(this._vm, to_luastring(p))
      } else if (i < path.length-1) {
        lua.lua_setfield(this._vm, -2, to_luastring(p))
        type = lua.lua_getfield(this._vm, -1, to_luastring(p))        
      }
      if (type <= 0) this._throwError();
    }
  }

  /**
   * Sets a JavaScript function at the specified path on the VM state.
   * Automatically detects if the function is an `AsyncFunction`, and if so
   * handles yielding and resuming from Lua.
   *
   * @param {String|Array} path Lua path
   * @param {Function} callback JavaScript function
   * @param {Object} opts Options
   * @return {VM}
   */
  setFunction(path, callback, opts = {}) {
    this.set(path, function(vm) {
      let nargs = lua.lua_gettop(vm)
      let args = new Array(Math.max(0, nargs))
      if (nargs > 0) {
        for (let i = 0; i < nargs; i++) {
          args[i] = interop.tojs(vm, i+1)
        }
      }

      // If AsyncFunction attempt to pause and resume Lua execution
      if (opts.async || callback.constructor.name === 'AsyncFunction') {
        Promise.resolve(callback(...args))
          .then(r => {
            interop.push(vm, r)
            lua.lua_resume(vm, null, 1)
          })
          .catch(err => {
            lauxlib.luaL_error(vm, to_luastring(err.message))
          })
        lua.lua_yield(vm, 0)

      // Otherwise, just call the function
      } else {
        const r = callback(...args)
        interop.push(vm, r)
        return 1
      }
    }, opts)
    return this
  }

  /**
   * Evaluates the given script within the VM state and returns the result.
   *
   * @param {String} code Lua code string
   * @return {String|Number|Object|Array|Function}
   */
  eval(code, opts = {}) {
    this.exec(code)

    return interop.tojs(this._vm, -1)
  }

  /**
   * Evaluates the given script within the VM state and returns the modified
   * state.
   *
   * @param {String} code Lua code string
   * @return {VM}
   */
  exec(code) {
    let status
    lua.lua_settop(this._vm, 0)
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();

    return this
  }

  /**
   * Calls a function within the VM state at the given lua path and returns the
   * result.
   *
   * @param {String|Array} path Lua path
   * @param {Array} args Function arguments
   * @return {String|Number|Object|Array|Function}
   */
  call(path, args = [], opts = {}) {
    if (typeof path === 'string') {
      return this.call(path.split('.'), args)
    }
    let status
    path.forEach((p, i) => {
      let type,
          _path = to_luastring(p);
      if (i === 0) {
        type = lua.lua_getglobal(this._vm, _path)
      } else {
        type = lua.lua_getfield(this._vm, -1, _path)
      }
      if (type <= 0) this._throwError();
    })
    lauxlib.luaL_checkstack(this._vm, args.length, null)
    args.forEach(a => interop.push(this._vm, a))
    status = lua.lua_pcall(this._vm, args.length, 1, 0)

    if (status !== 0) this._throwError();
    return interop.tojs(this._vm, -1)
  }

  /**
   * Generic error handler
   * @private
   */
  _throwError() {
    const err = lua.lua_tojsstring(this._vm, -1)
    throw new Error(`Lua Error: ${ err }`);
  }
}

module.exports = VM