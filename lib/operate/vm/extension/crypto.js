const binary = require('bops')
//const crypto = require('@trust/webcrypto')
const Extension = require('../extension')

class Crypto extends Extension {
  static extend(vm) {
    vm.set('crypto', [])
      .set('crypto.aes', [])
      .set('crypto.ecdsa', [])
      .set('crypto.ecies', [])
      .set('crypto.rsa', [])
      .set('crypto.hash', [])
      .set('crypto.bitcoin_message', [])
      .setFunction('crypto.aes.encrypt', this.aesEncrypt)
      .setFunction('crypto.aes.decrypt', this.aesDecrypt)
      .setFunction('crypto.ecies.encrypt', this.eciesEncrypt)
      .setFunction('crypto.ecies.decrypt', this.eciesDecrypt)
      .setFunction('crypto.ecdsa.sign', this.ecdsaSign)
      .setFunction('crypto.ecdsa.verify', this.ecdsaVerify)
      .setFunction('crypto.rsa.encrypt', this.rsaEncrypt)
      .setFunction('crypto.rsa.decrypt', this.rsaDecrypt)
      .setFunction('crypto.rsa.sign', this.rsaSign)
      .setFunction('crypto.rsa.verify', this.rsaVerify)
      .setFunction('crypto.hash.ripemd160', (...args) => this.hash('ripemd160', ...args))
      .setFunction('crypto.hash.sha1', (...args) => this.hash('sha1', ...args))
      .setFunction('crypto.hash.sha256', (...args) => this.hash('sha256', ...args))
      .setFunction('crypto.hash.sha512', (...args) => this.hash('sha512', ...args))
      .setFunction('crypto.bitcoin_message.sign', this.bitcoinMessageSign)
      .setFunction('crypto.bitcoin_message.verify', this.bitcoinMessageVerify)
  }

  static hash(algo, data, opts = {}) {

  }

  static async aesEncrypt(data, key, opts = {}) {
  }

  static async aesDecrypt(data, key, opts = {}) {
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
