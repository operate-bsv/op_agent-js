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
   *
   * @param {String|Array} path Lua path
   * @param {Function} callback JavaScript function
   * @param {Object} opts Options
   * @return {VM}
   */
  setFunction(path, callback, opts = {}) {
    if (opts.async) {
      return this.setAsyncFunction(path, callback, opts)
    }
    
    this.set(path, function(vm) {
      let nargs = lua.lua_gettop(vm)
      let args = new Array(Math.max(0, nargs))
      if (nargs > 0) {
        for (let i = 0; i < nargs; i++) {
          args[i] = interop.tojs(vm, i+1)
        }
      }

      const r = callback(...args)
      interop.push(vm, r)
      return 1
    }, opts)
    return this
  }

  /**
   * Sets an asynchronous JavaScript function at the specified path on the VM
   * state. Can only be used in code evaluated with `evalAsync()`.
   *
   * @param {String|Array} path Lua path
   * @param {Function} callback JavaScript function
   * @param {Object} opts Options
   * @return {VM}
   */
  setAsyncFunction(path, callback, opts = {}) {
    this.set(path, function(vm) {
      let nargs = lua.lua_gettop(vm)
      let args = new Array(Math.max(0, nargs))
      if (nargs > 0) {
        for (let i = 0; i < nargs; i++) {
          args[i] = interop.tojs(vm, i+1)
        }
      }

      Promise.resolve(callback(...args))
        .then(r => {
          interop.push(vm, r)
          lua.lua_resume(vm, null, 1)
        })
        .catch(err => {
          lauxlib.luaL_error(vm, to_luastring(err.message))
        })
      lua.lua_yield(vm, 0)
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
   * Wraps the given code in a coroutine and evaluates it within the VM state
   * and asynchronously returns the result. Must be used when the script depends
   * on async functions.
   *
   * @param {String} code Lua code string
   * @return {Promise}
   */
  async evalAsync(code, opts = {}) {
    this.exec(this._wrapAsyncCode(code))
    const args = opts.args || []

    return new Promise((resolve, reject) => {
      const vm = lua.lua_tothread(this._vm, -1)
      lauxlib.luaL_checkstack(vm, args.length, null)
      args.forEach(a => interop.push(vm, a))
      lua.lua_resume(vm, null, args.length)

      const pollThread = function(time) {
        const status = lua.lua_status(vm)
        if (status === 1) {
          setTimeout(pollThread, time, Math.min(time * 2, 124))
        } else if (status === 0) {
          const res = interop.tojs(vm, -1)
          resolve(res)
        } else {
          const err = lua.lua_tojsstring(vm, -1)
          reject(new Error(`Lua Error: ${ err }`))
        }
      }
      setTimeout(pollThread, 1, 1)
    })
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
   * Wraps Lua code in a coroutine for async execution.
   * @private
   */
  _wrapAsyncCode(str) {
    return str.replace(/^\s*(--\[\[[\s\S]+\]\][\-]*)?([\s\S]+)$/, (_m, _p1, code) => {
      let m = code.match(/^\s*return\s+(function\s*\([\s\S]*\))([\s\S]+)end\s*$/)
      if (m) {
        return `return coroutine.create(${ m[1] + m[2] }end)`
      } else {
        return `return coroutine.create(function()\n${ code }\nend)`
      }
    })
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