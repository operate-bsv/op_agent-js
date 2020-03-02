const binary = require('bops')

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
    if (this.index) vm.set('ctx.cell_index', this.index);
    if (this.dataIndex) vm.set('ctx.data_index', this.dataIndex);
    const func = vm.eval(this.op, { decode: true })
    const res = func(opts.state, ...this.params)
    return opts.decode ? vm.decode(res) : res
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
    const buf = binary.from(b, 'base64')
    if (buf.some(b => b > 127)) {
      return binary.to(buf, 'hex')
    } else {
      return binary.to(buf)
    }
  }

  /**
   * Normalizes the cell param.
   * @private
   */
  static _normalizeParam({ b }) {
    if (b) {
      const buf = binary.from(b, 'base64')
      return binary.to(buf)
    }
  }

}

module.exports = Cell