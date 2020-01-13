const axios = require("axios");
const Adapter = require("./../adapter");

const client = axios.create({
  baseURL: "https://bob.planaria.network/q/1GgmC7Cg782YtQ6R9QkM58voyWeQJmJJzG/"
});

if (typeof btoa === "undefined") {
  function btoa(str) {
    return Buffer.from(str).toString("base64");
  }
}

/**
 * Adapter module for loading tapes and Ops from [BOB](https://bob.planaria.network).
 * @class {Bob}
 @ @extends {Adapter}
 */
class Bob extends Adapter {
  constructor(opts) {
    super({
      apiKey: "_", // Bob expects a key, although it is unused at the moment
      ...opts
    });
  }

  /**
   * Returns the client interface.
   * @static
   */
  static get client() {
    return client;
  }

  static async fetch(path, { headers }) {
    const response = await this.client.get(path, { headers });

    if (response.data.status == "invalid") {
      throw new Error(`Planaria error: ${response.data.errors}`);
    }

    return response;
  }

  /**
   * Fetches a transaction by the given txid, and returns a Promise.
   * @param {String} txid Transaction id
   * @return {Promise}
   */
  async fetchTx(txid) {
    const path = Bob._encodeQuery({
      v: "3",
      q: {
        find: {
          "tx.h": txid,
          "out.tape": {
            $elemMatch: {
              i: 0,
              "cell.op": 106
            }
          }
        },
        limit: 1
      }
    });
    const headers = { key: this.opts.apiKey };

    const response = await Bob.fetch(path, { headers });
    return Bob._toBPU(response.data)[0];
  }

  /**
   * Fetches a list of transactions by the given query object, and returns a Promise.
   *
   * The `query` parameter should be a valid Bitquery. The `project` attribute
   * cannot be used and unless otherwise specified, `limit` defaults to `10`.
   *
   * @param {Object} query Query object
   * @return {Promise}
   */
  async fetchTxBy(query) {
    delete query.project;

    const path = Bob._encodeQuery({
      v: "3",
      q: {
        limit: 10,
        ...query
      }
    });
    const headers = { key: this.opts.apiKey };

    const response = await Bob.fetch(path, { headers });
    return Bob._toBPU(response.data);
  }

  /**
   * Normalise response in standard BPU format
   * @static
   * @private
   */
  static _toBPU(data) {
    if (!data.c) {
      console.log(data);
    }
    return data.c.concat(data.u).map(tx => {
      tx.txid = tx.tx.h;
      delete tx.tx;
      tx.out.forEach(o => {
        if (o.e.a === "false") {
          o.e.a = null;
        }
      });
      return tx;
    });
  }

  /**
   * Encodes map into Fat URI path
   * @static
   * @private
   */
  static _encodeQuery(query) {
    return btoa(JSON.stringify(query));
  }
}

module.exports = Bob;
