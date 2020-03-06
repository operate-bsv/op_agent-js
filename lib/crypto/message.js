const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const isUtf8 = require('isutf8')
const Hash = require('./hash')
const util = require('./util')
const { secp256k1Loader } = require('./wasm')

/**
 * TODO
 */
const BitcoinMessage = {
  /**
   * TODO
   */
  async sign(message, key, opts= {}) {
    const secp256k1 = await secp256k1Loader()
    if (!binary.is(message))
      message = binary.from(message);

    const encoding = opts.encoding || 'base64'
    const isCompressed = opts.compressed || true
    const hash = await this.messageDigest(message)

    const { recoveryId, signature } = secp256k1.signMessageHashRecoverableCompact(key, hash)

    const buf = binary.join([
      this.sigPrefix(recoveryId, isCompressed),
      binary.from(signature)
    ])

    return encoding ? util.encode(buf, encoding) : buf;
  },

  /**
   * TODO
   */
  async verify(signature, message, key, opts= {}) {
    const secp256k1 = await secp256k1Loader()
    const encoding = opts.encoding || 'base64'
    if (encoding)
      signature = util.decode(signature, encoding);
    if (!binary.is(message))
      message = binary.from(message);

    const prefix = binary.readUInt8(signature, 0)
    const sig = binary.subarray(signature, 1)
    const isCompressed = prefix > 30
    const recoveryId = prefix - (isCompressed ? 31 : 27)
    const hash = await this.messageDigest(message)

    if (typeof key === 'string') {
      try {
        key = isCompressed ?
          secp256k1.recoverPublicKeyCompressed(sig, recoveryId, hash) :
          secp256k1.recoverPublicKeyUncompressed(sig, recoveryId, hash)
      } catch(e) {
        return false
      }
    }
    
    return secp256k1.verifySignatureCompact(sig, key, hash)
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