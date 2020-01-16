const Bob = require("../operate/adapter/bob");
const OpApi = require("../operate/adapter/op_api");
const NoCache = require("../operate/cache/no_cache");
const Adapter = require("../operate/adapter");
const Tape = require("../operate/tape");

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
  constructor({
    tapeAdapter = Bob,
    opAdapter = OpApi,
    cache = NoCache,
    extensions = [],
    aliases = {},
    strict = true,
    vm = null
  } = {}) {
    this.adapters = {
      tapeAdapter,
      opAdapter,
      cache
    };

    this.extensions = extensions;
    this.aliases = aliases;
    this.strict = strict;
    this.vm = vm;
  }

  /**
   * Initializes and sets adapter instances.
   * @private
   * @param {Array} adapters List of adapter modules or instances
   */
  set adapters(adapters) {
    for (const adapter in adapters) {
      this[adapter] =
        adapters[adapter] instanceof Adapter
          ? adapters[adapter]
          : new adapters[adapter]();
    }
  }

  /**
   * Loads a tape from the given txid.
   *
   * Fetches the tape transaction output as well as all of the required
   * functions, and returns a Promise.
   *
   * @param {String} txid Transaction id
   * @return {Promise(Tape)}
   */
  async loadTape(txid) {
    const tx = await this.cache.fetchTx(txid, this.tapeAdapter);
    return await this.prepTape(tx);
  }

  /**
   * Loads a tape from the given query.
   *
   * The expected format of the query will depend on the Adapter in use.
   * The transactions as well as all required functions are loaded and a Promise
   * is returned resolving in a list of Tapes.
   *
   * @param {Object} query Query object
   * @return {Promise(Array(Tapes))}
   */
  async loadTapesBy(query) {
    const txns = await this.cache.fetchTxBy(query, this.tapeAdapter);
    return await this.prepTapes(txns);
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
   * @returns {Promise(Tape)}
   */
  async prepTape(tx) {
    let tape;

    try {
      tape = Tape.fromBPU(tx);
    } catch (error) {
      if (this.strict) throw error;
      return;
    }

    const opRefs = tape.getOpRefs(this.aliases);
    const ops = await this.cache.fetchOps(opRefs, this.opAdapter);
    tape.setCellOps(ops, this.aliases);
    return tape;
  }

  /**
   * Takes an array of transactions, loads their required Ops and returns an array of tapes.
   *
   * @private
   * @param {Array} txns
   * @returns {Promise(Array(Tape))}
   */
  async prepTapes(txns) {
    const tapes = await Promise.all(txns.map(async tx => this.prepTape(tx)));
    return tapes.filter(tape => tape);
  }
}

module.exports = Agent;
