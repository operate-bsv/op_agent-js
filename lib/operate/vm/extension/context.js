const binary = require('bops')
const Extension = require('../extension')

/**
 * Extends the VM state with functions for accessing the transaction context.
 */
class Context extends Extension {
  static extend(vm) {
    vm.set('ctx', [])
      .setFunction('ctx.tx_input', (...args) => this.txInput(vm, ...args))
      .setFunction('ctx.tx_output', (...args) => this.txOutput(vm, ...args))
      .setFunction('ctx.get_tape', (...args) => this.getTape(vm, ...args))
      .setFunction('ctx.get_cell', (...args) => this.getCell(vm, ...args))
  }

  /**
   * Fetches the input from the context tx.
   */
  static txInput(vm, index) {
    const tx = vm.get('ctx.tx');
    return tx ? tx.in[index] : undefined;
  }

  /**
   * Fetches the output from the context tx.
   */
  static txOutput(vm, index) {
    const tx = vm.get('ctx.tx');
    return tx ? tx.out[index] : undefined;
  }

  /**
   * Fetches the current tape from the context tx.
   */
  static getTape(vm) {
    const index = vm.get('ctx.tape_index');
    const output = this.txOutput(vm, index);
    if (output === undefined) return;
    const tape = output.tape.reduce((acc, curr) => {
      return acc.concat(this._normalizeCells(curr.cell));
    }, []);
    tape.pop();
    return tape;
  }

  /**
   * Fetches the cell from the context tx.
   */
  static getCell(vm, index) {
    const cellIndex = index ? index : vm.get('ctx.cell_index');
    const tapeIndex = vm.get('ctx.tape_index');
    const output = this.txOutput(vm, tapeIndex);
    if (output) {
      const cell = output.tape[cellIndex].cell;
      const normalizedCell = this._normalizeCells(cell);
      normalizedCell.pop();
      return normalizedCell;
    }
  }

  /**
   * Normalizes list of BPU cells into simplified objects
   * @private
   */
  static _normalizeCells(cells) {
    const mapped = cells.map(cell => {
      let b
      if (cell.op) {
        b = binary.create(1)
        binary.writeUInt8(b, cell.op)
        return { b, op: cell.op }
      } else {
        b = binary.from(cell.b, 'base64')
        return { b: binary.to(b) }
      }
    })
    if (!mapped.some(cell => cell.op === 106)) {
      mapped.push({ b: '|' })
    }
    return mapped
  }
}

module.exports = Context