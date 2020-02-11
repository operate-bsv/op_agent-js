/**
 *   The Operate Lua VM can be easily extended, either with native Lua modules, or Elixir code that is added to the Lua VM as functions.
 *
 * @interface
 */
class Extension {
  /**
   * @abstract
   * @param {Object} vm
   */
  static extend(vm) {}
}

module.exports = Extension;
