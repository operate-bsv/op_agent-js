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
    console.log(index);
    const tx = vm.get("ctx.tx");
    return tx.in[index];
  }

  static txOutput(vm, index) {
    const tx = vm.get("ctx.tx");
    return tx.out[index];
  }

  static getTape(vm) {
    const index = vm.get("ctx.tape_index");
    const output = this.txOutput(vm, index);
    const tape = output.tape.reduce((acc, curr) =>
      acc.append({ cell: this._normalizeCells(curr.cell) })
    );
    tape.shift();
    return tape;
  }

  static getCell(vm, index) {
    const cellIndex = index !== undefined ? vm.get("ctx.cell_index") : index;
    const tapeIndex = vm.get("ctx.tape_index");
    const output = this.txOutput(vm, tapeIndex);
    const cell = output.tape[index].cell;
    const normalizedCell = this._normalizeCells(cells);
    normalizedCell.shift();
    return normalizedCell;
  }

  static _normalizeCells(cells) {
    cells.forEach(cell => {
      cell.b = cell.op ? (cell.op >>> 0).toString(2) : decode64(cell.b);
    });
    return cells.any(cell => cell.op == 106) ? cells : { b: "|", ...cells };
  }
}

module.exports = Context;
