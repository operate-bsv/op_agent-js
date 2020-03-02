const binary = require('bops')
const Extension = require('../extension')

/**
 * Extends the VM state with functions for encoding and decoding hex and base64
 */
class Base extends Extension {
  static extend(vm) {
    vm.set('base', [])
      .setFunction('base.encode16', this.encode16)
      .setFunction('base.decode16', this.decode16)
      .setFunction('base.encode64', this.encode64)
      .setFunction('base.decode64', this.decode64)
  }

  /**
   * Encodes the given string into a hex string.
   */
  static encode16(str) {
    const buf = binary.from(str)
    return binary.to(buf, 'hex')
  }

  /**
   * Decodes the given hex string into a utf8 string.
   */
  static decode16(str) {
    const buf = binary.from(str, 'hex')
    return binary.to(buf)
  }

  /**
   * Encodes the given string into a base64 string.
   */
  static encode64(str) {
    const buf = binary.from(str)
    return binary.to(buf, 'base64')
  }

  /**
   * Decodes the given base64 string into a utf8 string.
   */
  static decode64(str) {
    const buf = binary.from(str, 'base64')
    return binary.to(buf)
  }
}

module.exports = Base
