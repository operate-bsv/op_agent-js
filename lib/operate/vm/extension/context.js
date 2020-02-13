const binary = require('bops')
const Extension = require("../extension");
const { encode16, decode16, encode64, decode64 } = require("../../../utils");

class Context extends Extension {
  static extend(vm) {
    vm.set("ctx", [])
      .setFunction("ctx.tx_input", (...args) => this.txInput(vm, ...args), {
        force: true
      })
      .setFunction("ctx.tx_output", (...args) => this.txOutput(vm, ...args))
      .setFunction("ctx.get_tape", (...args) => this.getTape(vm, ...args))
      .setFunction("ctx.get_cell", (...args) => this.getCell(vm, ...args));
  }

  static txInput(vm, index) {
    const tx = vm.get("ctx.tx");
    return tx ? tx.in[index] : undefined;
  }

  static txOutput(vm, index) {
    const tx = vm.get("ctx.tx");
    return tx ? tx.out[index] : undefined;
  }

  static getTape(vm) {
    const index = vm.get("ctx.tape_index");
    const output = this.txOutput(vm, index);
    if (output === undefined) return;
    const tape = output.tape.reduce((acc, curr) => {
      return acc.concat(this._normalizeCells(curr.cell));
    }, []);
    tape.pop();
    return tape;
  }

  static getCell(vm, index) {
    const cellIndex = index ? index : vm.get("ctx.cell_index");
    const tapeIndex = vm.get("ctx.tape_index");
    const output = this.txOutput(vm, tapeIndex);
    if (output) {
      const cell = output.tape[cellIndex].cell;
      const normalizedCell = this._normalizeCells(cell);
      normalizedCell.pop();
      return normalizedCell;
    }
  }

  static _normalizeCells(cells) {
    const mapped = cells.map(cell => {
      if (cell.op) {
        const b = binary.create(1)
        binary.writeUInt8(b, cell.op)
        return { b, op: cell.op }
      } else {
        return { b: decode64(cell.b) }
      }
    })
    if (!mapped.some(cell => cell.op === 106)) {
      mapped.push({ b: '|' })
    }
    return mapped;
  }
}

module.exports = Context;
