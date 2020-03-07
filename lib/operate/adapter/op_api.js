const { URL, URLSearchParams } = require('url')
const fetch = require('node-fetch')
const Adapter = require('./../adapter')

const baseUrl = 'https://api.operatebsv.org'


/**
 * Adapter module for loading Ops from the [Operate API](http://api.operatebsv.org).
 * @class {OpApi}
 @ @extends {Adapter}
 */
class OpApi extends Adapter {

  /**
   * Fetches a list of Ops by the given list of Op references, and returns a Promise.
   * @static
   * @param {Array} refs Op references
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchOps(refs, opts = {}) {
    const url = new URL(baseUrl + '/ops')
    url.search = new URLSearchParams({ refs, fn: true }).toString()

    return fetch(url)
      .then(r => r.json())
      .then(data => data.data.map(this._toOp))
  }


  /**
   * Normalise response in standard Op format
   * @private
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