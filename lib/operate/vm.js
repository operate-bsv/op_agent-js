const { lua, lauxlib, lualib, to_luastring } = require('fengari')
const Agent = require('./agent')
const interop = require('fengari-interop')

const defaultExtensions = [
 './vm/extension/agent',
 './vm/extension/base',
//  './vm/extension/context',
//  './vm/extension/crypto',
//  './vm/extension/json'
].map(ext => require(ext))

/**
 * Operate VM module. Responsible for initalizing the VM state and evaluating
 * and executing Lua code in the VM.
 * @class {VM}
 */
class VM {

  /**
   * Initliazes a new VM state.
   * @return {VM}
   */
  constructor(opts = {}) {
    this.agent = opts.agent || new Agent(opts)
    const extensions = opts.extensions || []
    this._vm = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(this._vm)
    interop.luaopen_js(this._vm)
    defaultExtensions.concat(extensions)
      .forEach(ext => this.extend(ext))
  }

  /**
   * Extends the VM state with the given module or modules.
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
   * @param {String|Array} path Lua path
   * @return {String|Number|Object|Array|Function}
   */
  get(path) {
    if (typeof path === 'string') {
      return this.get(path.split('.'))
    }
    path.forEach((p, i) => {
      let type;
      if (i === 0) {
        type = lua.lua_getglobal(this._vm, to_luastring(p))
      } else {
        type = lua.lua_getfield(this._vm, -1, to_luastring(p))
      }
      if (type <= 0) this._throwError();
    })
    return this.decodedValue()
  }

  /**
   * Sets the value at the specified path on the VM state.
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
        interop.push(this._vm, value)
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

      if (i < path.length-1 && type !== 5) {
        throw new Error('Invalid Lua path.')
      } else if (type <= 0) {
        this._throwError()
      }
    })
    return this
  }

  /**
   * Sets the value at the specified deeply nested path on the VM state.
   * @param {String|Array} path Lua path
   * @param {String|Number|Object|Array} value Value
   * @return {VM}
   */
  setDeep(path, value) {
    if (typeof path === 'string') {
      return this.setDeep(path.split('.'), value)
    }

    path.forEach((p, i) => {
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
    })
  }

  /**
   * Sets a JavaScript function at the specified path on the VM state.
   * @param {String|Array} path Lua path
   * @param {Function} callback JavaScript function
   * @param {Object} opts Options
   * @return {VM}
   */
  setFunction(path, callback, opts = {}) {
    return this.set(path, function() {
      return callback.bind(void 0, this).apply(void 0, arguments)
    }, opts)
    return this
  }

  /**
   * Evaluates the given script within the VM state and returns the result.
   * @param {String} code Lua code string
   * @return {String|Number|Object|Array|function}
   */
  eval(code) {
    let status;
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();
    
    return this.decodedValue()
  }

  /**
   * Evaluates the given script within the VM state and returns the modified
   * state.
   * @param {String} code Lua code string
   * @return {VM}
   */
  exec(code) {
    let status;
    status = lauxlib.luaL_dostring(this._vm, to_luastring(code))
    if (status !== 0) this._throwError();

    return this
  }

  /**
   * Calls a function within the VM state at the given lua path and returns the
   * result.
   * @param {String|Array} path Lua path
   * @param {Array} args Function arguments
   * @return {String|Number|Object|Array|function}
   */
  call(path, args = []) {
    if (typeof path === 'string') {
      return this.call(path.split('.'), args)
    }
    let status;
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
    args.forEach(a => interop.push(this._vm, a))
    status = lua.lua_pcall(this._vm, args.length, 1, 0)
    if (status !== 0) this._throwError();
    return this.decodedValue()
  }

  /**
   * Decodes the top value from the VM state stack into a JavaScript type.
   * Handles converting Lua tables into either JavaScript arrays or maps.
   * @return {String|Number|Object|Array|function}
   */
  decodedValue() {
    const res = interop.tojs(this._vm, -1)
    return this._decode(res)
  }

  /**
   * Decodes the given value into a JavaScript type. Wraps functions to so
   * arguments can be passed in sane order.
   * @private
   */
  _decode(val) {
    if (Array.isArray(val) && val.length === 1) {
      return this._decode(val[0])
    } else if (typeof val === 'function') {
      const type = val.toString()
      // Lua functions must be wrapped so argumnets can be shuffled
      if ( /^function/.test(type) ) {
        return (...args) => {
          try {
            const head = args.shift(),
                res = val.invoke(head, args);
            return this._decode(res)
          } catch(e) {
            throw new Error(`Lua Error: ${ e }`);
          }
        }
      }
      // Convert tables into a Map object
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