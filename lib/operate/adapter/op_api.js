const axios = require('axios')
const Adapter = require('./../adapter')
const Op = require('./../op')

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
   * @param {String} txid Transaction id
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchOps(refs, opts = {}) {
    const params = { refs, fn: true }

    return this.client.get('/ops', { params })
      .then(r => r.data.data.map(o => new Op(o)))
  }

}

module.exports = OpApi