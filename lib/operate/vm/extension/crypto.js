const Extension = require('../extension')
const util = require('../../util')
const { Hash, AES, ECDSA, ECIES, RSA, BitcoinMessage } = require('../../../crypto')

/**
 * Extends the VM state with common crypto functions.
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
      .setFunction('crypto.aes.encrypt',    this.aesEncrypt)
      .setFunction('crypto.aes.decrypt',    this.aesDecrypt)
      .setFunction('crypto.ecies.encrypt',  this.eciesEncrypt)
      .setFunction('crypto.ecies.decrypt',  this.eciesDecrypt)
      .setFunction('crypto.ecdsa.sign',     this.ecdsaSign)
      .setFunction('crypto.ecdsa.verify',   this.ecdsaVerify)
      .setFunction('crypto.rsa.encrypt',    this.rsaEncrypt)
      .setFunction('crypto.rsa.decrypt',    this.rsaDecrypt)
      .setFunction('crypto.rsa.sign',       this.rsaSign)
      .setFunction('crypto.rsa.verify',     this.rsaVerify)
      .setFunction('crypto.hash.ripemd160', this.ripemd160)
      .setFunction('crypto.hash.sha1',      async (...args) => this.hash('SHA-1', ...args))
      .setFunction('crypto.hash.sha256',    async (...args) => this.hash('SHA-256', ...args))
      .setFunction('crypto.hash.sha512',    async (...args) => this.hash('SHA-512', ...args))
      .setFunction('crypto.bitcoin_message.sign',   this.bitcoinMessageSign)
      .setFunction('crypto.bitcoin_message.verify', this.bitcoinMessageVerify)
  }

  /**
   * Hashes the given data using the specified algorithm.
   */
  static async hash(algo, data, opts) {
    return Hash.hash(
      algo,
      data,
      util.mapToObject(opts, false))
  }

  /**
   * Hashes the given data using the RIPEMD160 algorithm.
   */
  static async ripemd160(data, opts) {
    return Hash.ripemd160(
      data,
      util.mapToObject(opts, false))
  }

  /**
   * Encrypts the given data with the given secret using AES-GCM.
   */
  static async aesEncrypt(data, key, opts) {
    return AES.GCM.encrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Decrypts the given data with the given secret using AES-GCM.
   */
  static async aesDecrypt(data, key, opts) {
    return AES.GCM.decrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Encrypts the given data with the given ECDSA public key using ECIES.
   */
  static async eciesEncrypt(data, key, opts) {
    return ECIES.encrypt(
      data,
      key,
      util.mapToObject(opts, false))
  }

  /**
   * Decrypts the given data with the given ECDSA private key using ECIES.
   */
  static async eciesDecrypt(data, key, opts) {
    return ECIES.decrypt(data, key, util.mapToObject(opts, false))
  }

  /**
   * Signs the given data with the given ECDSA private key.
   */
  static async ecdsaSign(data, key, opts) {
    return ECDSA.sign(data, key, util.mapToObject(opts, false))
  }

  /**
   * Verifies the given signature and message with the given ECDSA public key.
   */
  static async ecdsaVerify(sig, data, key, opts = {}) {
    return ECDSA.verify(sig, data, key, util.mapToObject(opts, false))
  }

  /**
   * Encrypts the given data with the given RSA public or private key.
   */
  static async rsaEncrypt(data, key, opts = {}) {
    return RSA.encrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Decrypts the given data with the given RSA public or private key.
   */
  static async rsaDecrypt(data, key, opts = {}) {
    return RSA.decrypt(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Signs the given data with the given RSA private key.
   */
  static async rsaSign(data, key, opts = {}) {
    return RSA.sign(
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Verifies the given signature and message with the given RSA public key.
   */
  static async rsaVerify(sig, data, key, opts = {}) {
    return RSA.verify(
      sig,
      data,
      util.mapToObject(key),
      util.mapToObject(opts, false))
  }

  /**
   * Signs the given Bitcoin Message with the given ECDSA private key.
   */
  static async bitcoinMessageSign(data, key, opts = {}) {
    return BitcoinMessage.sign(
      data,
      key,
      util.mapToObject(opts, false))
  }

  /**
   * Verifies the given signature and Bitcoin Message with the given ECDSA public key.
   */
  static async bitcoinMessageVerify(sig, data, key, opts = {}) {
    return BitcoinMessage.verify(
      sig,
      data,
      key,
      util.mapToObject(opts, false))
  }
}

module.exports = CryptoExt