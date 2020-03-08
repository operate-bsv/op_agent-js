const binary = require('bops')
const Extension = require('../extension')

/**
 * Extends the VM state with functions for accessing the transaction context.
 */
class ContextExt extends Extension {
  static extend(vm) {
    vm.set('ctx', [])
      .setFunction('ctx.tx_input',  (...args) => this.txInput(vm, ...args))
      .setFunction('ctx.tx_output', (...args) => this.txOutput(vm, ...args))
      .setFunction('ctx.get_tape',  (...args) => this.getTape(vm, ...args))
      .setFunction('ctx.get_cell',  (...args) => this.getCell(vm, ...args))
  }

  /**
   * Fetches the input from the context tx.
   */
  static txInput(vm, index) {
    const tx = vm.get('ctx.tx')
    return tx ? tx.get('in')[index] : undefined;
  }

  /**
   * Fetches the output from the context tx.
   */
  static txOutput(vm, index) {
    const tx = vm.get('ctx.tx')
    return tx ? tx.get('out')[index] : undefined;
  }

  /**
   * Fetches the current tape from the context tx.
   */
  static getTape(vm) {
    const index = vm.get('ctx.tape_index'),
          output = this.txOutput(vm, index);
    if (output) {
      const tape = output.get('tape').reduce((acc, curr) => {
        return acc.concat(this._normalizeCells(curr.get('cell')))
      }, [])
      tape.pop()
      return tape
    }
  }

  /**
   * Fetches the cell from the context tx.
   */
  static getCell(vm, index) {
    const cellIndex = index ? index : vm.get('ctx.cell_index'),
          tapeIndex = vm.get('ctx.tape_index'),
          output = this.txOutput(vm, tapeIndex);
    if (output) {
      const cell = output.get('tape')[cellIndex].get('cell'),
            normalizedCell = this._normalizeCells(cell);
      normalizedCell.pop()
      return normalizedCell
    }
  }

  /**
   * Normalizes list of BPU cells into simplified objects
   * @private
   */
  static _normalizeCells(cells) {
    const mapped = cells.map(cell => {
      let b
      if (cell.has('op')) {
        b = binary.create(1)
        binary.writeUInt8(b, cell.get('op'))
        return { b, op: cell.get('op') }
      } else {
        b = binary.from(cell.get('b'), 'base64')
        return { b: binary.to(b) }
      }
    })
    if (!mapped.some(cell => cell.op === 106)) {
      mapped.push({ b: '|' })
    }
    return mapped
  }
}

module.exports = ContextExt