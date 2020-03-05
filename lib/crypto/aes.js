const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const util = require('./util')

/**
 * TODO
 */
const GCM = {
  /**
   * TODO
   */
  async encrypt(data, key, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);

    const encKey = await util.importKey(key, { name: 'AES-GCM' }, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const aad = opts.add ? binary.from(opts.add) : undefined;

    const encData = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: iv,
      additionalData: aad
    }, encKey, data)

    const buf = binary.join([iv, binary.from(encData)])
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  async decrypt(data, key, opts = {}) {
    if (opts.encoding)
      data = binary.from(data, opts.encoding);

    const encKey = await util.importKey(key, { name: 'AES-GCM' }, ['decrypt'])
    const iv = binary.subarray(data, 0, 12)
    const encData = binary.subarray(data, 12)
    const aad = opts.add ? binary.from(opts.add) : undefined;

    const decData = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv: iv,
      additionalData: aad
    }, encKey, encData)

    return binary.from(decData)
  }
}

module.exports = {
  GCM
}