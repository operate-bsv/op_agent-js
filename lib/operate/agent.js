const Adapter = require('./adapter')
const Tape = require('./tape')

/**
 * The Agent module responsible for loading and running tapes.
 *
 * @class {Agent}
 */

class Agent {

  /**
   * Creates an Agent instance.
   * @param {Object} config Configuration options
   * @return {Agent}
   */
  constructor(config = {}) {
    this.config = config
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

    let [cache, cacheConfig] = this._adapterWithOpts(config.cache)
    const adapter = this._adapterWithOpts(config.tape_adapter)
    const tx = await cache.fetchTx(txid, cacheConfig, adapter)
    return await this.prepTape(tx)
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
   * @return {Promise(Array(Tapes))}
   */
  async loadTapesBy(query, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }

    let [cache, cacheConfig] = this._adapterWithOpts(config.cache)
    const adapter = this._adapterWithOpts(config.tape_adapter)
    const txns = await cache.fetchTxBy(query, cacheConfig, adapter)
    return await this.prepTapes(txns)
  }

  /**
   * Runs the given tape executing each of the tape's cells and returns a tape.
   *
   * @param {Tape} tape Tape instance
   * @return {Promise(Tape)}
   */
  async runTape(tape) {
    // todo @cambrian
  }

  /**
   * Takes a transaction, loads its required Ops and returns a tape.
   *
   * @private
   * @param {Object} tx
   * @param {Object} opts Options
   * @returns {Promise(Tape)}
   */
  async prepTape(tx, opts = {}) {
    const config = {
      ...this.config,
      ...opts
    }
    let tape

    try {
      tape = Tape.fromBPU(tx)
    } catch (error) {
      if (this.config.strict) throw error;
      return
    }

    const opRefs = tape.getOpRefs(config.aliases)

    let [cache, cacheConfig] = this._adapterWithOpts(config.cache)
    const adapter = this._adapterWithOpts(config.op_adapter)
    const ops = await cache.fetchOps(opRefs, cacheConfig, adapter)
    tape.setCellOps(ops, config.aliases)
    return tape
  }

  /**
   * Takes an array of transactions, loads their required Ops and returns an array of tapes.
   *
   * @private
   * @param {Array} txns
   * @param {Object} opts Options
   * @returns {Promise(Array(Tape))}
   */
  async prepTapes(txns, opts = {}) {
    const tapes = await Promise.all(
      txns.map(async tx => this.prepTape(tx, opts))
    );
    return tapes.filter(tape => tape);
  }

  /**
   * Returns the adapter and options in a tuple pair.
   *
   * @private
   * @param {Adapter|Array} adapter
   */
  _adapterWithOpts(adapter) {
    return Array.isArray(adapter) ? adapter : [adapter, {}];
  }
}

module.exports = Agent;