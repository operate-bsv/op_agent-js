const binary = require('bops')
const Hash = require('./hash')
const { secp256k1Loader } = require('./wasm')

/**
 * TODO
 */
const ECDSA = {
  /**
   * TODO
   */
  async sign(data, privKey, opts = {}) {
    const secp256k1 = await secp256k1Loader()
    if (!binary.is(data))
      data = binary.from(data);
    if (opts.hash)
      data = await Hash.sha256(data);

    const sig = secp256k1.signMessageHashDER(privKey, data)
          buf = binary.from(sig);
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  async verify(sig, data, pubKey, opts = {}) {
    const secp256k1 = await secp256k1Loader()
    if (opts.encoding)
      sig = binary.from(sig, opts.encoding);
    if (!binary.is(data))
      data = binary.from(data);
    if (opts.hash)
      data = await Hash.sha256(data);

    return secp256k1.verifySignatureDER(sig, pubKey, data)
  }
}

module.exports = ECDSA