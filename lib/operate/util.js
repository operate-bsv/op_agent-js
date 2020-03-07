const binary = require('bops')

/**
 * A collection of commonly used helper functions.
 */
const util = {
  // Export BOPs binary helpers
  binary,

  /**
   * Converts the given map to an object. By default runs recursively.
   *
   * @param {Map} map Map object
   * @param {Boolean} deep Recusive. Defaults true.
   * @return {Object}
   */
  mapToObject(map, deep = true) {
    if (!(map instanceof Map)) return map;

    const obj = {}
    for (let [key, val] of map) {
      if (deep && Array.isArray(val)) {
        obj[key] = val.map(v => this.mapToObject(v, deep))
      }
      else if (deep && val instanceof Map) {
        obj[key] = this.mapToObject(val, deep)
      }
      else {
        obj[key] = val
      }
    }
    return obj
  }

}

module.exports = util