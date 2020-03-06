const {
  instantiateRipemd160,
  instantiateSecp256k1
} = require('bitcoin-ts')

/**
 * TODO
 */
module.exports = {
  ripemd160Loader: () => instantiateRipemd160(),
  secp256k1Loader: () => instantiateSecp256k1()
}