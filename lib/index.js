const Agent = require("./operate/agent");
const Bob = require("./operate/adapter/bob");
const OpApi = require("./operate/adapter/op_api");
const NoCache = require("./operate/cache/no_cache");

// Default config
const config = {
  tapeAdapter: Bob,
  opAdapter: OpApi,
  cache: NoCache,
  extensions: [],
  aliases: {},
  strict: true,
  vm: null,

  /**
   * Merges the given attributes with the config
   * @param {Object} opts Options
   */
  set(opts = {}) {
    Object.assign(this, opts);
  }
};

/**
 * Load and run Operate programs (known as "tapes") encoded in Bitcoin SV
 * transactions.
 *
 * Operate is a toolset to help developers build applications, games and
 * services on top of Bitcoin (SV). It lets you write functions, called "Ops",
 * and enables transactions to become small but powerful programs, capable of
 * delivering new classes of services layered over Bitcoin.
 *
 * @class {Operate}
 */
class Operate {
  /**
   * Returns the config.
   * @static
   */
  static get config() {
    return config;
  }

  /**
   * Returns a new Agent instance.
   *
   * @param {Object} config
   */
  static createAgent(opts = {}) {
    const config = {
      ...this.config,
      ...opts
    };
    return new Agent(config);
  }

  /**
   * Loads a tape from the given txid.
   *
   * Fetches the tape transaction output as well as all of the required
   * functions, and returns a Promise.
   *
   * Any configuration option can be overridden.
   *
   * @param {String} txid Transaction id
   * @param {Object} opts Options
   * @return {Promise}
   */
  static loadTape(txid, opts = {}) {
    return this.createAgent(opts).loadTape(txid);
  }

  /**
   * Loads a tape from the given query.
   *
   * The expected format of the query will depend on the Adapter in use.
   * The transactions as well as all required functions are loaded and a Promise
   * is returned resolving in a list of Tapes.
   *
   * Any configuration option can be overridden.
   *
   * @param {Object} query Query object
   * @param {Object} opts Options
   * @return {Promise}
   */
  static loadTapesBy(query, opts = {}) {
    return this.createAgent(opts).loadTapesBy(query);
  }

  /**
   * Runs the given tape executing each of the tape's cells and returns Tape.
   *
   * @param {Tape} tape Tape instance
   * @param {Object} opts Options
   * @return {Promise}
   */
  static runTape(tape, opts = {}) {
    return this.createAgent(opts).runTape(tape);
  }
}

module.exports = Operate;
