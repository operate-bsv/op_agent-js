/**
 * An adapter is responsible for loading tapes and ops from a datasource -
 * potentially a web API, a database or even a Bitcoin node. Operate ships with
 * two default adapters, although these can be swapped out with any other adpater
 * by changing the configuration.
 *
 * An adapter must implement one or more of the following static methods:
 *
 * * `fetchTx()`
 * * `fetchTxBy()`
 * * `fetchOps()`
 *
 * @interface {Adapter}
 */
class Adapter {
  /**
   * Fetches a transaction by the given txid, and returns a Promise.
   * @abstract
   * @param {String} txid Transaction id
   * @param {Object} opts Adapter options
   * @return {Promise}
   */
  static fetchTx(txid, opts = {}) {
    throw `${this.constructor.name}.fetchTx() not implemented`;
  }

  /**
   * Fetches a list of transactions by the given query object, and returns a Promise.
   * @abstract
   * @param {Object} query Query object
   * @param {Object} opts Adapter options
   * @return {Promise}
   */
  static fetchTxBy(query, opts = {}) {
    throw `${this.constructor.name}.fetchTxBy() not implemented`;
  }

  /**
   * Fetches a list of Ops by the given list of Op references, and returns a Promise.
   * @abstract
   * @param {Array} refs Op references
   * @param {Object} opts Adapter options
   * @return {Promise}
   */
  static fetchOps(refs, opts = {}) {
    throw `${this.constructor.name}.fetchOps() not implemented`;
  }
}

module.exports = Adapter;
