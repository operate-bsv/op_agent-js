const { URL, URLSearchParams } = require('url')
const fetch = require('node-fetch')
const Shapeshifter = require('@libitx/shapeshifter.js')
const Adapter = require('./../adapter')

const baseUrl = 'https://api.mattercloud.net/api/v3/main/'


/**
 * Adapter module for loading tapes from [Matterpool](https://bob.planaria.network).
 *
 * @class
 * @extends Adapter
 * @category Adapters
 * @hideconstructor
 */
class MatterpoolAdapter extends Adapter {

  /**
   * Fetches a transaction by the given txid, and returns a Promise.
   *
   * @static
   * @param {String} txid Transaction id
   * @param {Object} opts Options
   * @return {Promise}
   */
  static fetchTx(txid, opts = {}) {
    const path = 'rawtx/' + txid
    const url = new URL(baseUrl + path)
    if (opts.apiKey) {
      url.search = new URLSearchParams({ api_key: opts.apiKey }).toString()
    }

    return fetch(url)
      .then(r => r.json())
      .then(({ rawtx }) => Shapeshifter.toBob(rawtx.raw))
      .then(tx => this._toBPU([tx])[0])
  }

  /**
   * Normalise response in standard BPU format
   * @private
   */
  static _toBPU(txns) {
    return txns
      .map(tx => {
        tx.txid = tx.tx.h
        delete tx.tx
        tx.out.forEach(o => {
          if (o.e && o.e.a === "false")
            o.e.a = null;
        })
        return tx
      })
  }

}

module.exports = MatterpoolAdapter