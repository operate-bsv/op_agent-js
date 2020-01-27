const Bob = require('./adapter/bob')
const OpApi = require('./adapter/op_api')
const NoCache = require('./cache/no_cache')

const allowedKeys = ['tape_adapter', 'op_adapter', 'cache', 'extensions', 'aliases', 'strict']

// Default config
const config = {
  tape_adapter: Bob,
  op_adapter: OpApi,
  cache: NoCache,
  extensions: [],
  aliases: {},
  strict: true,

  /**
   * Merges the given attributes with the config
   * @param {Object} opts Options
   */
  set(opts = {}) {
    Object.keys(opts)
      .filter(k => allowedKeys.includes(k))
      .forEach(k => {
        this[k] = opts[k]
      })
  }
}

module.exports = config