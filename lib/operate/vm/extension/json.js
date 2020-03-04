const Extension = require('../extension')
const util = require('../../util')

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
    return val
  }

  /**
   * Encodes the given value into a JSON string
   */
  static encode(vm, val) {
    if (val instanceof Map)
      val = util.mapToObject(val);
    return JSON.stringify(val)
  }
}

module.exports = JsonExt