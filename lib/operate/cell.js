if (typeof atob === 'undefined') {
  function atob(base64) {
    return Buffer.from(base64, 'base64').toString()
  }
}

function toHex(str) {
  if (typeof TextEncoder === 'undefined') {
    return Buffer.from(str).toString('hex')
  } else {
    const enc = new TextEncoder()
    return Array.prototype.map.call(enc.encode(b), x => {
      return ('00' + x.toString(16)).slice(-2)
    }).join('')
  }
}

/**
 * Class for working with Operate tape cells.
 *
 * A cell represents a single atomic procedure call. A Cell contains the Op
 * script and parameters. When the cell is executed it returns a result.
 * @class {Cell}
 */
class Cell {

  /**
   * Creates a Cell instance.
   * @param {Object} attrs Attributes
   * @return {Cell}
   */
  constructor(attrs = {}) {
    this.ref = attrs.ref
    this.params = attrs.params || []
    this.op = attrs.op
    this.index = attrs.index
    this.dataIndex = attrs.dataIndex
  }

  /**
   * Converts the given BPU Cell into an Operate Cell.
   * @static
   * @param {Object} attrs BPU Cell
   * @return {Cell}
   */
  static fromBPU({ cell, i }) {
    const head = cell.shift(),
          ref = this._decodeRef(head),
          params = cell.map(c => this._normalizeParam(c));

    return new this({
      ref,
      params,
      index: i,
      dataIndex: head.ii
    })
  }

  /**
   * Executes the Cell in the given VM state.
   * @param {VM} vm VM state
   * @param {Object} opts Options
   * @return {Promise}
   */
  exec(vm, opts = {}) {
    const state = opts.state
    if (this.index) vm.set('ctx.cell_index', this.index);
    if (this.dataIndex) vm.set('ctx.data_index', this.dataIndex);
    const func = vm.eval(this.op)
    return func(opts.state, ...this.params)
  }

  /**
   * Validates the given cell. Returns true if the cell has a reference and
   * script.
   * @return {Boolean}
   */
  get isValid() {
    return ['ref', 'op'].every(a => this[a] && this[a].length)
  }


  /**
   * Normalizes the reference. Handles decoding if it is in raw binary.
   * @private
   */
  static _decodeRef({ b }) {
    const ref = atob(b)
    if ([...ref].some(c => c.charCodeAt(0) > 127)) {
      return toHex(ref)
    } else {
      return ref
    }
  }

  /**
   * Normalizes the cell param.
   * @private
   */
  static _normalizeParam({ b }) {
    if (b) return atob(b);
  }

}

module.exports = Cell