const AES = require('./aes')
const ECDSA = require('./ecdsa')
const ECIES = require('./ecies')
const Hash = require('./hash')
const RSA = require('./rsa')
const BitcoinMessage = require('./message')

/**
 * Collection of necessary crypto functions.
 * TODO: Eventually this should be extracted to its own repo.
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