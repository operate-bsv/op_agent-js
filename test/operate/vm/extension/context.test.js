const { resolve } = require("path");
const VM = require(resolve("lib/operate/vm"));
const { assert } = require("chai");
const ContextExtension = require(resolve("lib/operate/vm/extension/context"));
const { _toBPU } = require(resolve("lib/operate/adapter/bob"));

describe("ContextExtension.txInput", () => {
  let vm;
  before(() => {
    vm = new VM();
    const tx = require(resolve("test/mocks/bob_fetch_tx.json"));
    const bpu = _toBPU(tx)[0];
    vm.set("ctx.tx", bpu)
      .set("ctx.tape_index", 0)
      .set("ctx.cell_index", 2)
      .set("ctx.data_index", 7);
  });
  it("with state must return the input by index", () => {
    const res = vm.eval("return ctx.tx_input(0)");
    assert.deepEqual(Object.keys(res), ["e", "i", "tape"]);
    assert.deepEqual(Object.keys(res.e), ["a", "h", "i"]);
  });
});
