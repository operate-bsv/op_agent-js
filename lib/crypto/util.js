const binary = require('bops')
const crypto = require('isomorphic-webcrypto')

/**
 * TODO
 */
const util = {
  /**
   * TODO
   */
  importKey(key, algo, usages) {
    const format = binary.is(key) ? 'raw' : 'jwk';
    return crypto.subtle.importKey(format, key, algo, false, usages)
  },

  varIntEncode(val) {
    let buf;
    if (val < 253) {
      buf = binary.create(1)
      binary.writeUInt8(buf, val)
    }
    else if (val < 0x10000) {
      buf = binary.create(3)
      binary.writeUInt8(buf, 253)
      binary.writeUInt16LE(buf, val)
    }
    else if (val < 0x100000000) {
      buf = binary.create(5)
      binary.writeUInt8(buf, 254)
      binary.writeUInt32LE(buf, val)
    } else {
      buf = binary.create(9)
      binary.writeUInt8(buf, 255)
      binary.writeUInt64LE(buf, val)
    }
    return buf
  }
}

module.exports = util