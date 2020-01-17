const Extension = require("../extension");

/**
 * Extends the VM state with functions for accessing the running agent.
 */
class Agent extends Extension {
  static extend(vm) {
    vm.agent = {
      exec: this.exec,
      load_tape: this.loadTape,
      load_tapes_by: this.loadTapesBy,
      run_tape: this.runTape
    };
  }

  /**
   * @deprecated
   */
  static exec(txid, state = null) {
    const agent = Operate.createAgent();
    const tape = agent.loadTape(txid);
    return agent.runTape(tape);
  }

  /**
   * Loads a tape by the given txid and returns the tape.
   *
   * @param {String} txid
   * @param {Object} opts
   */
  static loadTape(txid, opts = {}) {
    return Operate.Agent(opts).loadTape(txid);
  }

  /**
   * Loads a list of tapes by the given query and returns the list.
   *
   * @param {Object} query
   * @param {Object} opts
   */
  static loadTapesBy(query, opts = {}) {
    return Operate.Agent(opts).loadTapesBy(txid);
  }

  /**
   * Runs the given tape, and returns the result.
   *
   * @param {Object} tape Tape instance
   * @param {Object} opts Options
   */
  static runTape(tape, opts = {}) {
    return Operate.Agent(opts).runTape(txid);
  }
}
