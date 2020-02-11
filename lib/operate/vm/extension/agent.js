const Extension = require("../extension");

/**
 * Extends the VM state with functions for accessing the running agent.
 */
class Agent extends Extension {
  static extend(vm) {
    vm.setFunction("agent.load_tape", (...args) => this.loadTape(vm, ...args), {
      force: true
    })
      .setFunction("agent.load_tapes_by", (...args) =>
        this.loadTapesBy(vm, ...args)
      )
      .setFunction("agent.local_tape", (...args) => this.localTape(vm, ...args))
      .setFunction("agent.run_tape", (...args) => this.runTape(vm, ...args));
  }

  /**
   * Loads a tape by the given txid and returns the tape.
   *
   * @param {String} txid
   * @param {Object} opts
   */
  static async loadTape(vm, txid, opts = {}) {
    return await vm.agent.loadTape(txid, opts);
  }

  /**
   * Loads a list of tapes by the given query and returns the list.
   *
   * @param {Object} query
   * @param {Object} opts
   */
  static async loadTapesBy(vm, query, opts = {}) {
    return await vm.agent.loadTapesBy(query, opts);
  }

  /**
   * Loads a tape of the current transaction by output index.
   *
   * @param {Object} index
   * @param {Object} opts
   */
  static localTape(vm, index, opts = {}) {
    const tx = vm.get("ctx.tx");
    return vm.agent._prepTape(tx, index, opts);
  }

  /**
   * Runs the given tape, and returns the result.
   *
   * @param {Object} tape Tape instance
   * @param {Object} opts Options
   */
  static runTape(vm, tape, opts = {}) {
    return vm.agent.runTape(tape, opts);
  }
}

module.exports = Agent;
