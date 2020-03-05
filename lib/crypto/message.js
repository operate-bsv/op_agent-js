const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const secp256k1 = require('noble-secp256k1')
const isUtf8 = require('isutf8')
const Hash = require('./hash')
const util = require('./util')

/**
 * TODO
 */
const BitcoinMessage = {
  /**
   * TODO
   */
  async sign(message, key, opts= {}) {
    if (!binary.is(message))
      message = binary.from(message);

    const encoding = opts.encoding || 'base64'
    const isCompressed = opts.compressed || true
    const hash = await this.messageDigest(message)
    const [sig, recovery] = secp256k1.sign(hash, key, { recovered: true })

    const buf = binary.join([
      this.sigPrefix(recovery, isCompressed),
      binary.from(sig)
    ])

    return encoding ? binary.to(buf, encoding) : buf;
  },

  /**
   * TODO
   */
  async verify(signature, message, key, opts= {}) {
    const encoding = opts.encoding || 'base64'
    if (encoding)
      signature = binary.from(signature, encoding);
    if (!binary.is(message))
      message = binary.from(message);

    const prefix = binary.readUInt8(signature, 0)
    const sig = binary.subarray(signature, 1)
    const isCompressed = prefix > 30
    const recovery = prefix - (isCompressed ? 31 : 27)
    const hash = await this.messageDigest(message)

    // NYI
    return false

    if (typeof key === 'string') {
      key = secp256k1.recoverPublicKey(hash, sig, recovery)
      if (isCompressed)
        key = util.compressPubKey(key);
    }
    
    return secp256k1.verify(sig, hash, key)
  },


  messageDigest(message) {
    const prefix = binary.from('Bitcoin Signed Message:\n')
    const data = binary.join([
      util.varIntEncode(prefix.length),
      prefix,
      util.varIntEncode(message.length),
      message
    ])
    return Hash.sha256sha256(data)
  },

  sigPrefix(recovery, isCompressed) {
    const n = isCompressed ? 31 : 27;
    const buf = binary.create(1)
    binary.writeUInt8(buf, Number(recovery) + n)
    return buf
  }
}

module.exports = BitcoinMessage