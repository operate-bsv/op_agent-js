const axios = require('axios')
const Adapter = require('./../adapter')

const client = axios.create({
  baseURL: 'https://api.operatebsv.org/'
});


/**
 * Adapter module for loading Ops from the [Operate API](http://api.operatebsv.org).
 * @class {OpApi}
 @ @extends {Adapter}
 */
class OpApi extends Adapter {

  /**
   * Returns the client interface.
   * @static
   */
  static get client() {
    return client
  }

  /**
   * Fetches a list of Ops by the given list of Op references, and returns a Promise.
   * @static
   * @param {Array} refs Op references
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchOps(refs, opts = {}) {
    const params = { refs, fn: true }

    return this.client.get('/ops', { params })
      .then(r => r.data.data.map(this._toOp))
  }


  /**
   * Normalise response in standard Op format
   * @static
   * @private
   * @return {Object}
   */
  static _toOp(r) {
    return {
      ref: r.ref,
      hash: r.hash,
      name: r.name,
      fn: r.fn,
    }
  }

}

module.exports = OpApi