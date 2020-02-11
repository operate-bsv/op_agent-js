const Extension = require('../extension')

/**
 * Extends the VM state with functions for encoding and decoding JSON.
 */
class JsonExt extends Extension {
  static extend(vm) {
    vm.setFunction('json.decode', this.decode, { force: true })
      .setFunction('json.encode', (...args) => this.encode(vm, ...args))
  }

  /**
   * Decodes the given JSON string.
   */
  static decode(val) {
    val = JSON.parse(val)
    if (Array.isArray(val)) {
      val.unshift(null)
    }
    return val
  }

  /**
   * Encodes the given value into a JSON string
   */
  static encode(vm, val) {
    val = vm._decode(val)
    if (val instanceof Map) {
      val = Array.from(val).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {})
    }
    return JSON.stringify(val)
  }
}

module.exports = JsonExt

