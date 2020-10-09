const { URL, URLSearchParams } = require('url')
const fetch = require('node-fetch')
const Shapeshifter = require('@libitx/shapeshifter.js')
const Adapter = require('../adapter')

const baseUrl = 'https://media.bitcoinfiles.org/'


/**
 * Adapter module for loading tapes from [BitcoinFiles](https://www.bitcoinfiles.org).
 *
 * @class
 * @extends Adapter
 * @category Adapters
 * @hideconstructor
 */
class BitcoinFilesAdapter extends Adapter {

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

    return fetch(url)
      .then(r => r.text())
      .then(rawtx => Shapeshifter.toBob(rawtx))
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

module.exports = BitcoinFilesAdapter