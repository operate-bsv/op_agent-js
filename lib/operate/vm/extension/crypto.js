const binary = require('bops')
const crypto = require('@trust/webcrypto')
const Extension = require('../extension')
const util = require('../../util')

/**
 * TODO
 */
class Crypto extends Extension {
  static extend(vm) {
    vm.set('crypto', [])
      .set('crypto.aes', [])
      .set('crypto.ecdsa', [])
      .set('crypto.ecies', [])
      .set('crypto.rsa', [])
      .set('crypto.hash', [])
      .set('crypto.bitcoin_message', [])
      .setAsyncFunction('crypto.aes.encrypt', this.aesEncrypt)
      .setAsyncFunction('crypto.aes.decrypt', this.aesDecrypt)
      .setFunction('crypto.ecies.encrypt', this.eciesEncrypt)
      .setFunction('crypto.ecies.decrypt', this.eciesDecrypt)
      .setFunction('crypto.ecdsa.sign', this.ecdsaSign)
      .setFunction('crypto.ecdsa.verify', this.ecdsaVerify)
      .setFunction('crypto.rsa.encrypt', this.rsaEncrypt)
      .setFunction('crypto.rsa.decrypt', this.rsaDecrypt)
      .setFunction('crypto.rsa.sign', this.rsaSign)
      .setFunction('crypto.rsa.verify', this.rsaVerify)
      .setFunction('crypto.hash.ripemd160', (...args) => this.hash('ripemd160', ...args))
      .setAsyncFunction('crypto.hash.sha1', (...args) => this.hash('SHA-1', ...args))
      .setAsyncFunction('crypto.hash.sha256', (...args) => this.hash('SHA-256', ...args))
      .setAsyncFunction('crypto.hash.sha512', (...args) => this.hash('SHA-512', ...args))
      .setFunction('crypto.bitcoin_message.sign', this.bitcoinMessageSign)
      .setFunction('crypto.bitcoin_message.verify', this.bitcoinMessageVerify)
  }

  /**
   * TODO
   */
  static async hash(algo, data, opts = {}) {
    if (!algo) throw new Error('Unsupported hash algorithm.');
    if (!binary.is(data))
      data = binary.from(data);
    if (opts instanceof Map)
      opts = util.mapToObject(opts, false);

    const hash = await crypto.subtle.digest({ name: algo }, data),
          buf = binary.from(hash);
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  }

  /**
   * TODO
   */
  static async aesEncrypt(data, key, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);
    if (opts instanceof Map)
      opts = util.mapToObject(opts, false);

    const encKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const aad = opts.add ? binary.from(opts.add) : undefined;

    const encData = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: iv,
      additionalData: aad
    }, encKey, data)

    const buf = binary.join([iv, binary.from(encData)])
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  }

  /**
   * TODO
   */
  static async aesDecrypt(data, key, opts = {}) {
    if (opts instanceof Map)
      opts = util.mapToObject(opts, false);
    if (opts.encoding)
      data = binary.from(data, opts.encoding);

    const encKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt'])
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

  static eciesEncrypt(data, key, opts = {}) {
  }

  static eciesDecrypt(data, key, opts = {}) {
  }

  static ecdsaSign(data, key, opts = {}) {
  }

  static ecdsaVerify(sig, data, key, opts = {}) {
  }

  static rsaEncrypt(data, key, opts = {}) {
  }

  static rsaDecrypt(data, key, opts = {}) {
  }

  static rsaSign(data, key, opts = {}) {
  }

  static rsaVerify(sig, data, key, opts = {}) {
  }

  static bitcoinMessageSign(data, key, opts = {}) {
  }

  static bitcoinMessageVerify(sig, data, key, opts = {}) {
  }
}

module.exports = Crypto
