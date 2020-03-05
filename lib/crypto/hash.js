const binary = require('bops')
const crypto = require('isomorphic-webcrypto')
const ripemd160 = require('noble-ripemd160').default

const hashAlgorithms = [
  'RIPEMD160',
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512'
]

/**
 * TODO
 */
const hash = {
  /**
   * TODO
   */
  async hash(algo, data, opts = {}) {
    if (!hashAlgorithms.includes(algo))
      throw new Error('Unsupported hash algorithm.');
    if (algo === 'RIPEMD160')
      return this.ripemd160(data, opts)
    if (!binary.is(data))
      data = binary.from(data);

    const hash = await crypto.subtle.digest({ name: algo }, data),
          buf = binary.from(hash);
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  ripemd160(data, opts = {}) {
    if (!binary.is(data))
      data = binary.from(data);

    const hash = ripemd160(data),
          buf = binary.from(hash);
    return opts.encoding ? binary.to(buf, opts.encoding) : buf;
  },

  /**
   * TODO
   */
  sha1(data, opts = {}) {
    return this.hash('SHA-1', data, opts)
  },

  /**
   * TODO
   */
  sha256(data, opts = {}) {
    return this.hash('SHA-256', data, opts)
  },

  /**
   * TODO
   */
  sha512(data, opts = {}) {
    return this.hash('SHA-512', data, opts)
  },

  /**
   * TODO
   */
  async sha256ripemd160(data, opts = {}) {
    data = await this.sha256(data)
    return this.ripemd160(data, opts)
  },

  /**
   * TODO
   */
  async sha256sha256(data, opts = {}) {
    data = await this.sha256(data)
    return this.sha256(data, opts)
  }
}

module.exports = hash