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
  constructor(opts = {}) {
    this.opts = opts;
  }

  /**
   * Loads a transaction from the cache by the given txid, or delegates to job
   * to the specified adapter.
   * @abstract
   * @param {String} txid Transaction id
   * @param {Object} adapter Adapter
   * @return {Promise}
   */
  fetchTx(txid, adapter) {
    return adapter.fetchTx(txid);
  }

  /**
   * Loads a list of transactions from the cache by the given query map, or
   * delegates to job to the specified adapter.
   * @abstract
   * @param {Object} query Query object
   * @param {Object} adapter Adapter
   * @return {Promise}
   */
  fetchTxBy(query, adapter) {
    return adapter.fetchTxBy(query);
  }

  /**
   * Loads Ops from the cache by the given procedure referneces, or delegates
   * the job to the specified adapter.
   * @abstract
   * @param {Array} refs Op references
   * @param {Object} adapter Adapter
   * @return {Promise}
   */
  fetchOps(refs, adapter) {
    return adapter.fetchOps(refs);
  }
}

module.exports = Cache;
