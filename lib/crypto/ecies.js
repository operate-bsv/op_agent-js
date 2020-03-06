const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const Hash = require('./hash')
const util = require('./util')
const { secp256k1Loader } = require('./wasm')

/**
 * TODO
 */
const ECIES = {
  /**
   * TODO
   */
  async encrypt(data, pubKey, opts = {}) {
    const secp256k1 = await secp256k1Loader()
    if (!binary.is(data))
      data = binary.from(data);

    // Generate ephemeral keys
    const ephemeralPrivKey = new Uint8Array(32)
    crypto.getRandomValues(ephemeralPrivKey)
    const ephemeralPubKey = secp256k1.derivePublicKeyCompressed(ephemeralPrivKey)

    // Derive ECDH key and sha512 hash
    const sharedKey = secp256k1.mulTweakPublicKeyCompressed(pubKey, ephemeralPrivKey)
    const keyHash = await Hash.sha512(sharedKey)

    // iv and keyE used in AES, keyM used in HMAC
    const iv = binary.subarray(keyHash, 0, 16),
          keyE = binary.subarray(keyHash, 16, 32),
          keyM = binary.subarray(keyHash, 32);

    // Create cyphertext
    const encKey = await util.importKey(keyE, { name: 'AES-CBC' }, ['encrypt'])
    const cyphertext = await crypto.subtle.encrypt({
      name: 'AES-CBC',
      iv: iv
    }, encKey, data)

    // Concatenate encrypted data with hmac
    const encData = binary.join([
      binary.from('BIE1'),
      ephemeralPubKey,
      binary.from(cyphertext)
    ])
    const hmacKey = await util.importKey(keyM, { name: 'HMAC', hash: 'SHA-256' }, ['sign'])
    const mac = await crypto.subtle.sign({ name: 'HMAC' }, hmacKey, encData)
    const buf = binary.join([encData, binary.from(mac)])

    return opts.encoding ? util.encode(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  async decrypt(data, privKey, opts = {}) {
    const secp256k1 = await secp256k1Loader()
    if (opts.encoding)
      data = util.decode(data, opts.encoding);

    const len = data.length - 69,
          prefix = binary.subarray(data, 0, 4),
          ephemeralPubKey = binary.subarray(data, 4, 4 + 33),
          cyphertext = binary.subarray(data, 4 + 33, 4 + 33 + len),
          mac = binary.subarray(data, 4 + 33 + len);

    // Derive ECDH key and sha512 hash
    const pubKey = secp256k1.uncompressPublicKey(ephemeralPubKey)
    const sharedKey = secp256k1.mulTweakPublicKeyCompressed(pubKey, privKey)
    const keyHash = await Hash.sha512(sharedKey)

    // iv and keyE used in AES, keyM used in HMAC
    const iv = binary.subarray(keyHash, 0, 16),
          keyE = binary.subarray(keyHash, 16, 32),
          keyM = binary.subarray(keyHash, 32);

    // HMAC validation
    const hmacKey = await util.importKey(keyM, { name: 'HMAC', hash: 'SHA-256' }, ['verify'])
    const verified = await crypto.subtle.verify({
      name: 'HMAC'
    }, hmacKey, mac, binary.subarray(data, 0, -32))
    
    if (!verified) throw new Error('mac validation failed');

    // Decrypt cyphertext
    const encKey = await util.importKey(keyE, { name: 'AES-CBC' }, ['decrypt'])
    const decData = await crypto.subtle.decrypt({
      name: 'AES-CBC',
      iv: iv
    }, encKey, cyphertext)

    return binary.from(decData)
  }
}

module.exports = ECIES