const Cell = require('./cell')

/**
 * Class for working with Operate tapes.
 *
 * An Operate program is a tape made up of one or more cells, where each cell
 * contains a single atomic procedure call (known as an "Op").
 *
 * When a tape is run, each cell is executed in turn, with the result from each
 * cell is passed to the next cell. This is known as the "state". Each cell
 * returns a new state, until the final cell in the tape returns the result of
 * the tape.
 * @class {Tape}
 */
class Tape {

  /**
   * Creates a Tape instance.
   * @param {Object} attrs Attributes
   * @return {Tape}
   */
  constructor(attrs = {}) {
    this.tx = attrs.tx
    this.index = attrs.index
    this.cells = attrs.cells || []
    this.result = null
    this.error = null
  }

  /**
   * Converts the given BPU Transaction into an Operate Tape.
   * @static
   * @param {Object} attrs BPU Transaction
   * @return {Tape}
   */
  static fromBPU(tx, index) {
    if (typeof index === 'undefined' || index === null) {
      const i = tx.out.findIndex(o => this._isOpReturnOutput(o))
      return this.fromBPU(tx, i)
    }

    let cells;
    if (index > -1 && tx.out[index] && this._isOpReturnOutput(tx.out[index])) {
      cells = tx.out[index].tape
        .filter(c => !this._isOpReturnCell(c))
        .map(c => Cell.fromBPU(c))
    } else {
      throw new Error('No tape found in transaction.')
    }

    return new this({
      tx,
      index,
      cells
    })
  }

  /**
   * Runs the tape in the given VM state.
   * @param {VM} vm VM state
   * @param {Object} opts Options
   * @return {Promise}
   */
  async run(vm, opts = {}) {
    const state = opts.state,
          strict = typeof opts.strict === 'undefined' ? true : opts.strict;
    vm.set('ctx.tx', this.tx || null)
    vm.set('ctx.tape_index', this.index || 0)

    const result = await this.cells.reduce(async (prevState, cell) => {
      const state = await prevState
      return cell.exec(vm, { state })
        .catch(e => {
          if (strict) {
            this.error = e
            throw e
          } else {
            return state
          }
        })
    }, Promise.resolve(state))

    this.result = result
    return result
  }

  /**
   * Sets the given Ops into the cells of the tape. If an aliases object is
   * specifed, this is used to reverse map any procedure scripts onto aliased
   * cells.
   * @param {Array} ops Op functions
   * @param {Object} aliases Aliases
   * @return {Tape}
   */
  setCellOps(ops, aliases = {}) {
    ops.forEach(op => {
      const refs = Object.keys(aliases)
        .filter(k => aliases[k] === op.ref)
      if (!refs.length) refs.push(op.ref);

      this.cells.forEach(cell => {
        if (refs.includes(cell.ref)) cell.op = op.fn;
      })

      return this;
    })
  }

  /**
   * Returns a list of Op references from the tape's cells. If an aliases object
   * is specifed, this is used to alias references to alternative values.
   * @param {Object} aliases Aliases
   * @return {Array}
   */
  getOpRefs(aliases = {}) {
    return this.cells
      .map(c => c.ref)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(ref => aliases[ref] || ref)
  }

  /**
   * Validates the given tape. Returns true if all the tape's cells are valid.
   * @return {Boolean}
   */
  get isValid() {
    return this.cells.every(c => c.isValid)
  }


  /**
   * Returns true if the BPU Script is an OP_RETURN script.
   * @private
   */
  static _isOpReturnOutput({ tape }) {
    return this._isOpReturnCell(tape[0])
  }

  /**
   * Returns true if the BPU Cell is an OP_RETURN cell.
   * @private
   */
  static _isOpReturnCell({ cell }) {
    return cell.some(c => c.op === 106)
  }

}

module.exports = Tape