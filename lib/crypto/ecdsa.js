const binary = require('bops')
const secp256k1 = require('noble-secp256k1')

/**
 * TODO
 */
const ECDSA = {
  /**
   * TODO
   */
  sign(data, key, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);

    const sig = secp256k1.sign(data, key),
          buf = binary.from(sig);
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  verify(sig, data, key, opts = {}) {
    if (opts.encoding)
      sig = binary.from(sig, opts.encoding);
    if (!binary.is(data))
      data = binary.from(data);

    return secp256k1.verify(sig, data, key)
  }
}

module.exports = ECDSA