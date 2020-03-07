const Bob = require('./adapter/bob')
const OpApi = require('./adapter/op_api')
const NoCache = require('./cache/no_cache')

const allowedKeys = ['tape_adapter', 'op_adapter', 'cache', 'extensions', 'aliases', 'strict']

const defaultAliases = {
  'meta': 'c8bca1c8', // Metanet
  '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva': 'a3a83843', // AIP
  '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': '6232de04', // B://
  '13SrNDkVzY5bHBRKNu5iXTQ7K7VqTh5tJC': 'a575f641', // Bitkey
  '1L8eNuA8ToLGK5aV4d5d9rXUAbRZUxKrhF': 'c8bca1c8', // Bit.sv
  '1HA1P2exomAwCUycZHr8WeyFoy5vuQASE3': 'ed469ce8', // HAIP
  '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5': 'b7f56e90', // MAP
  '19dbzMDDg4jZ4pvYzLb291nT8uCqDa61zH': '5ad609a8', // Preev
  '1LtyME6b5AnMopQrBPLk4FGN8UBuhxKqrn': '5ad609a8'  // WeatherSV
}

// Default config
const config = {
  tape_adapter: Bob,
  op_adapter: OpApi,
  cache: NoCache,
  extensions: [],
  aliases: {},
  strict: true,

  /**
   * Merges the given attributes with the config.
   *
   * @param {Object} opts Options
   * @return {this}
   */
  update(opts = {}) {
    Object.keys(opts)
      .filter(k => allowedKeys.includes(k))
      .forEach(k => {
        this[k] = opts[k]
      })
    return this
  },

  /**
   * Apply default aliases for common Bitcom protocols
   *
   * @return {this}
   */
  quickStartAliases() {
    Object.keys(defaultAliases)
      .forEach(k => {
        this.aliases[k] = this.aliases[k] || defaultAliases[k]
      })
    return this
  }
}

module.exports = config