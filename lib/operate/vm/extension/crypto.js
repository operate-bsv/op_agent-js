const Extension = require('../extension')
const util = require('../../util')
const { Hash, AES, ECDSA, ECIES, RSA, BitcoinMessage } = require('../../../crypto')

/**
 * TODO
 */
class CryptoExt extends Extension {
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
      .setAsyncFunction('crypto.ecies.encrypt', this.eciesEncrypt)
      .setAsyncFunction('crypto.ecies.decrypt', this.eciesDecrypt)
      .setAsyncFunction('crypto.ecdsa.sign', this.ecdsaSign)
      .setAsyncFunction('crypto.ecdsa.verify', this.ecdsaVerify)
      .setAsyncFunction('crypto.rsa.encrypt', this.rsaEncrypt)
      .setAsyncFunction('crypto.rsa.decrypt', this.rsaDecrypt)
      .setAsyncFunction('crypto.rsa.sign', this.rsaSign)
      .setAsyncFunction('crypto.rsa.verify', this.rsaVerify)
      .setAsyncFunction('crypto.hash.ripemd160', this.ripemd160)
      .setAsyncFunction('crypto.hash.sha1', (...args) => this.hash('SHA-1', ...args))
      .setAsyncFunction('crypto.hash.sha256', (...args) => this.hash('SHA-256', ...args))
      .setAsyncFunction('crypto.hash.sha512', (...args) => this.hash('SHA-512', ...args))
      .setAsyncFunction('crypto.bitcoin_message.sign', this.bitcoinMessageSign)
      .setAsyncFunction('crypto.bitcoin_message.verify', this.bitcoinMessageVerify)
  }

  /**
   * TODO
   */
  static hash(algo, data, opts) {
    return Hash.hash(
      algo,
      data,
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static ripemd160(data, opts) {
    return Hash.ripemd160(
      data,
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static aesEncrypt(data, key, opts) {
    return AES.GCM.encrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static aesDecrypt(data, key, opts) {
    return AES.GCM.decrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static eciesEncrypt(data, key, opts) {
    return ECIES.encrypt(
      data,
      key,
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static eciesDecrypt(data, key, opts) {
    return ECIES.decrypt(data, key, util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static ecdsaSign(data, key, opts) {
    return ECDSA.sign(data, key, util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static ecdsaVerify(sig, data, key, opts = {}) {
    return ECDSA.verify(sig, data, key, util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static rsaEncrypt(data, key, opts = {}) {
    return RSA.encrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static rsaDecrypt(data, key, opts = {}) {
    return RSA.decrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static rsaSign(data, key, opts = {}) {
    return RSA.sign(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static rsaVerify(sig, data, key, opts = {}) {
    return RSA.verify(
      sig,
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static bitcoinMessageSign(data, key, opts = {}) {
    return BitcoinMessage.sign(
      data,
      key,
      util.mapToObject(opts, false))
  }

  /**
   * TODO
   */
  static bitcoinMessageVerify(sig, data, key, opts = {}) {
    return BitcoinMessage.verify(
      sig,
      data,
      key,
      util.mapToObject(opts, false))
  }
}

module.exports = CryptoExt