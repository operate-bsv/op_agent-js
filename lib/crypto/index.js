const AES = require('./aes')
const ECDSA = require('./ecdsa')
const ECIES = require('./ecies')
const Hash = require('./hash')
const RSA = require('./rsa')
const BitcoinMessage = require('./message')

/**
 * TODO
 */
const Crypto = {
  AES,
  ECDSA,
  ECIES,
  Hash,
  RSA,
  BitcoinMessage
}

module.exports = Crypto