const Agent = require('./operate/agent')
const config = require('./operate/config')
const util = require('./operate/util')
const pkg = require('../package.json')

/**
 * Load and run Operate programs (known as "tapes") encoded in Bitcoin SV
 * transactions.
 *
 * Operate is a toolset to help developers build applications, games and
 * services on top of Bitcoin (SV). It lets you write functions, called "Ops",
 * and enables transactions to become small but powerful programs, capable of
 * delivering new classes of services layered over Bitcoin.
 *
 * @class
 * @hideconstructor
 */
class Operate {
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
   * @return {Promise(Tape)}
   */
  static loadTape(txid, opts = {}) {
    return new Agent(opts).loadTape(txid)
  }

  /** 
   * Loads a tape from the given query.
   *
   * The expected format of the query will depend on the Adapter in use.
   * The transactions as well as all required functions are loaded and a Proise
   * is returned resolving in a list of Tapes.
   *
   * Any configuration option can be overridden.
   *
   * @param {Object} query Query object
   * @param {Object} opts Options
   * @return {Promise(Array)}
   */
  static loadTapesBy(query, opts = {}) {
    return new Agent(opts).loadTapesBy(query)
  }

  /**
   * Runs the given tape executing each of the tape's cells and returns Tape.
   *
   * @param {Tape} tape Tape instance
   * @param {Object} opts Options
   * @return {Promise(any)}
   */
  static runTape(tape, opts = {}) {
    return new Agent(opts).runTape(tape, opts)
  }
}

/**
 * Returns the Agent class.
 * @static
 */
Operate.Agent = Agent

/**
 * Returns the config.
 * @static
 */
Operate.config = config

/**
 * Returns the util helper module.
 * @static
 */
Operate.util = util

/**
 * Returns version number.
 * @static
 */
Operate.version = pkg.version

module.exports = Operate