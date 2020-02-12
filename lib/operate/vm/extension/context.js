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
    const tape = output.tape.reduce((acc, curr) => {
      return acc.concat(this._normalizeCells(curr.cell));
    }, []);
    tape.shift();
    console.log(tape);
    return tape;
  }

  static getCell(vm, index) {
    const cellIndex = index == undefined ? vm.get("ctx.cell_index") : index;
    const tapeIndex = vm.get("ctx.tape_index");
    const output = this.txOutput(vm, tapeIndex);
    const cell = output.tape[cellIndex].cell;
    const normalizedCell = this._normalizeCells(cell);
    normalizedCell.shift();
    return normalizedCell;
  }

  static _normalizeCells(cells) {
    const mapped = cells.map(cell => ({
      b: cell.op ? (cell.op >>> 0).toString(2) : decode64(cell.b),
      op: cell.op
    }));
    if (!mapped.some(cell => cell.op == 106)) mapped.unshift({ b: "|" });
    return mapped;
  }
}

module.exports = Context;
