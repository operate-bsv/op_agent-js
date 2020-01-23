/**
 * A cache is responsible for storing and retrieving tapes and ops from a
 * cache, and if necessary instructing an adapter to fetch items from a data
 * source.
 *
 * A cache must implement all of the following callbacks:
 *
 * * `fetchTx()`
 * * `fetchTxBy()`
 * * `fetchOps()`
 *
 * @interface {Adapter}
 */
class Cache {
  /**
   * Loads a transaction from the cache by the given txid, or delegates to job
   * to the specified adapter.
   * @abstract
   * @param {String} txid Transaction id
   * @param {Object} opts Cache options
   * @param {Adapter} adapter Adapter
   * @param {Object} adapterOpts Adapter options
   * @return {Promise}
   */
  static fetchTx(txid, opts, [adapter, adapterOpts]) {
    return adapter.fetchTx(txid, adapterOpts);
  }

  /**
   * Loads a list of transactions from the cache by the given query map, or
   * delegates to job to the specified adapter.
   * @abstract
   * @param {Object} query Query object
   * @param {Object} opts Cache options
   * @param {Adapter} adapter Adapter
   * @param {Object} adapterOpts Adapter options
   * @return {Promise}
   */
  static fetchTxBy(query, opts, [adapter, adapterOpts]) {
    return adapter.fetchTxBy(query, adapterOpts);
  }

  /**
   * Loads Ops from the cache by the given procedure referneces, or delegates
   * the job to the specified adapter.
   * @abstract
   * @param {Array} refs Op references
   * @param {Object} opts Cache options
   * @param {Adapter} adapter Adapter
   * @param {Object} adapterOpts Adapter options
   * @return {Promise}
   */
  static fetchOps(refs, opts, [adapter, adapterOpts]) {
    return adapter.fetchOps(refs, adapterOpts);
  }
}

module.exports = Cache;
