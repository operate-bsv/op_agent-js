const Extension = require('../extension')
const util = require('../../util')

/**
 * Extends the VM state with functions for encoding and decoding JSON.
 */
class JsonExt extends Extension {
  static extend(vm) {
    vm.set('json', [])
      .setFunction('json.encode', this.encode)
      .setFunction('json.decode', this.decode)
  }

  /**
   * Encodes the given value into a JSON string
   */
  static encode(val) {
    if (val instanceof Map)
      val = util.mapToObject(val);
    return JSON.stringify(val)
  }

  /**
   * Decodes the given JSON string.
   */
  static decode(val) {
    val = JSON.parse(val)
    return val
  }
}

module.exports = JsonExt