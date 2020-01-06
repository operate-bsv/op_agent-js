const axios = require('axios')
const Adapter = require('./../adapter')

const client = axios.create({
  baseURL: 'https://bob.planaria.network/q/1GgmC7Cg782YtQ6R9QkM58voyWeQJmJJzG/'
});


/**
 * Adapter module for loading tapes and Ops from [BOB](https://bob.planaria.network).
 * @class {Bob}
 @ @extends {Adapter}
 */
class Bob extends Adapter {

  /**
   * Returns the client interface.
   * @static
   */
  static get client() {
    return client
  }

  /**
   * Fetches a transaction by the given txid, and returns a Promise.
   * @static
   * @param {String} txid Transaction id
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchTx(txid, opts = {}) {
    opts = {
      apiKey: '',
      ...opts
    }
    const path = this._encodeQuery({
      "v": "3",
      "q": {
        "find": {
          "tx.h": txid,
          "out.tape": {
            "$elemMatch": {
              "i": 0,
              "cell.op": 106
            }
          }
        },
        "limit": 1
      }
    })
    const headers = { key: opts.apiKey }

    return this.client.get(path, { headers })
      .then(r => this._toBPU(r.data)[0])
  }

  /**
   * Fetches a list of transactions by the given query object, and returns a Promise.
   * @static
   * @param {Object} query Query object
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchTxBy(query, opts = {}) {
    // todo
  }


  /**
   * Normalise response in standard BPU format
   * @static
   * @private
   * @return {Object}
   */
  static _toBPU(data) {
    return data.c
      .concat(data.u)
      .map(tx => {
        tx.txid = tx.tx.h
        delete tx.tx
        tx.out.forEach(o => {
          if (o.e.a === "false") {
            o.e.a = null
          }
        })
        return tx
      })
  }

  /**
   * Encodes map into Fat URI path
   * @static
   * @private
   * @return {String}
   */
  static _encodeQuery(query) {
    const json = JSON.stringify(query)
    if (typeof btoa === 'undefined') {
      return Buffer.from(json).toString('base64')
    } else {
      return btoa(json)
    }
  }

}

module.exports = Bob