const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const util = require('./util')

/**
 * TODO
 */
const RSA = {
  /**
   * TODO
   */
  async encrypt(data, key, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);

    const encKey = await util.importKey(key, { name: 'RSA-OAEP', hash: 'SHA-256' }, ['encrypt'])
    const encData = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, encKey, data)

    const buf = binary.from(encData)
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  async decrypt(data, key, opts = {}) {
    if (opts.encoding)
      data = binary.from(data, opts.encoding);

    const encKey = await util.importKey(key, { name: 'RSA-OAEP', hash: 'SHA-256' }, ['decrypt'])
    const decData = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, encKey, data)

    return binary.from(decData)
  },

  /**
   * TODO
   */
  async sign(data, key, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);

    const privKey = await util.importKey(key, { name: 'RSA-PSS', hash: 'SHA-256' }, ['sign'])
    const sig = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 20 }, privKey, data)

    const buf = binary.from(sig)
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  async verify(sig, data, key, opts = {}) {
    if (opts.encoding)
      sig = binary.from(sig, opts.encoding);
    if (!binary.is(data))
      data = binary.from(data);
    
    const pubKey = await util.importKey(key, { name: 'RSA-PSS', hash: 'SHA-256' }, ['verify'])
    return crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 20 }, pubKey, sig, data)
  }
}

module.exports = RSA