const Extension = require('../extension')
const interop = require('../interop')
const util = require('../../util')

/**
 * Extends the VM state with functions for accessing the running agent.
 *
 * @class
 * @extends Extension
 * @category Extensions
 * @hideconstructor
 */
class AgentExtension extends Extension {
  static extend(vm) {
    vm.set('agent', [])
      .setFunction('agent.load_tape',     async (...args) => this.loadTape(vm, ...args))
      .setFunction('agent.load_tapes_by', async (...args) => this.loadTapesBy(vm, ...args))
      .setFunction('agent.local_tape',    async (...args) => this.localTape(vm, ...args))
      .setFunction('agent.run_tape',      async (...args) => this.runTape(vm, ...args))
  }

  /**
   * Loads a tape by the given txid and returns the tape.
   */
  static async loadTape(vm, txid, opts = {}) {
    const tape = await vm.agent.loadTape(txid, opts)
    return interop.wrap(tape)
  }

  /**
   * Loads a list of tapes by the given query and returns the list.
   */
  static async loadTapesBy(vm, query, opts = {}) {
    const tapes = await vm.agent.loadTapesBy(
      util.mapToObject(query),
      {} // util.mapToObject(opts)
    ).then(tapes => {
      return tapes.map(t => interop.wrap(t))
    })
    return tapes
  }

  /**
   * Loads a tape of the current transaction by output index.
   */
  static async localTape(vm, index, opts = {}) {
    const tx = vm.get('ctx.tx')
    const tape = await vm.agent._prepTape(
      util.mapToObject(tx),
      index,
      util.mapToObject(opts, false)
    )
    return interop.wrap(tape)
  }

  /**
   * Runs the given tape, and returns the result.
   */
  static async runTape(vm, tape, opts = {}) {
    if (opts instanceof Map)
      opts = util.mapToObject(opts, false);
    return vm.agent.runTape(tape, opts)
  }
}

module.exports = AgentExtension