const Adapter = require('./adapter')
const Tape = require('./tape')
const VM = require('./vm')
const defaultConfig = require('./config')

/**
 * The Agent module responsible for loading and running tapes.
 *
 * @class
 */

class Agent {

  /**
   * Creates an Agent instance.
   *
   * @param {Object} opts Configuration options
   * @return {Agent}
   */
  constructor(opts = {}) {
    this.config = {
      ...defaultConfig,
      ...opts
    }
  }

  /**
   * Loads a tape from the given txid.
   *
   * Fetches the tape transaction output as well as all of the required
   * functions, and returns a Promise.
   *
   * @param {String} txid Transaction id
   * @param {Object} opts Options
   * @return {Promise(Tape)}
   */
  async loadTape(txid, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }

    let index
    [txid, index] = txid.split('/')
    const [cache, cacheConfig] = this._adapterWithOpts(config.cache)
    const adapter = this._adapterWithOpts(config.tape_adapter)
    const tx = await cache.fetchTx(txid, cacheConfig, adapter)
    return await this._prepTape(tx, index, config)
  }

  /**
   * Loads a tape from the given query.
   *
   * The expected format of the query will depend on the Adapter in use.
   * The transactions as well as all required functions are loaded and a Promise
   * is returned resolving in a list of Tapes.
   *
   * @param {Object} query Query object
   * @param {Object} opts Options
   * @return {Promise(Array)}
   */
  async loadTapesBy(query, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }

    const [cache, cacheConfig] = this._adapterWithOpts(config.cache)
    const adapter = this._adapterWithOpts(config.tape_adapter)
    const txns = await cache.fetchTxBy(query, cacheConfig, adapter)
    return await this._prepTapes(txns, config)
  }

  /**
   * Runs the given tape executing each of the tape's cells and returns a tape.
   *
   * @param {Tape} tape Tape instance
   * @return {Promise(any)}
   */
  async runTape(tape, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }
    const vm = new VM({ agent: this, extensions: config.extensions }),
          state = config.state,
          execOpts = { state, strict: config.strict };
    return await tape.run(vm, execOpts)
  }

  /**
   * Takes a transaction, loads its required Ops and returns a tape.
   * @private
   */
  async _prepTape(tx, index, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }

    let tape
    try {
      tape = Tape.fromBPU(tx, index)
      const refs = tape.getOpRefs(config.aliases)
      let [cache, cacheConfig] = this._adapterWithOpts(config.cache)
      const adapter = this._adapterWithOpts(config.op_adapter)
      const ops = await cache.fetchOps(refs, cacheConfig, adapter)
      tape.setCellOps(ops, config.aliases)
    } catch (error) {
      if (this.config.strict) throw error;
    }

    return tape
  }

  /**
   * Iterates over an array of transactions, preparing each and returns an array
   * of tapes.
   * @private
   */
  async _prepTapes(txns, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }

    let tape
    const tapes = []
    for (let i = 0; i < txns.length; i++) {
      tape = await this._prepTape(txns[i], undefined, config)
      if (tape) tapes.push(tape);
    }
    return tapes
  }

  /**
   * Returns the adapter and options in a tuple pair.
   * @private
   */
  _adapterWithOpts(adapter) {
    return Array.isArray(adapter) ? adapter : [adapter, {}]
  }
}

module.exports = Agent