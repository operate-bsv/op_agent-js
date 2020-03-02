const Extension = require('../extension')

/**
 * Extends the VM state with functions for accessing the running agent.
 */
class Agent extends Extension {
  static extend(vm) {
    vm.set('agent', [])
      .setAsyncFunction('agent.load_tape', (...args) => this.loadTape(vm, ...args))
      .setAsyncFunction('agent.load_tapes_by', (...args) => this.loadTapesBy(vm, ...args))
      .setAsyncFunction('agent.local_tape', (...args) => this.localTape(vm, ...args))
      .setAsyncFunction('agent.run_tape', (...args) => this.runTape(vm, ...args))
  }

  /**
   * Loads a tape by the given txid and returns the tape.
   *
   * @param {String} txid
   * @param {Object} opts
   */
  static async loadTape(vm, txid, opts = {}) {
    return vm.agent.loadTape(txid, opts)
  }

  /**
   * Loads a list of tapes by the given query and returns the list.
   *
   * @param {Object} query
   * @param {Object} opts
   */
  static async loadTapesBy(vm, query, opts = {}) {
    return vm.agent.loadTapesBy(query, opts)
  }

  /**
   * Loads a tape of the current transaction by output index.
   *
   * @param {Object} index
   * @param {Object} opts
   */
  static async localTape(vm, index, opts = {}) {
    const tx = vm.get('ctx.tx')
    return vm.agent._prepTape(tx, index, opts)
  }

  /**
   * Runs the given tape, and returns the result.
   *
   * @param {Object} tape Tape instance
   * @param {Object} opts Options
   */
  static async runTape(vm, tape, opts = {}) {
    return vm.agent.runTape(tape, opts)
  }
}

module.exports = Agent