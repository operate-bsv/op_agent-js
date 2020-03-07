/**
 * A collection of commonly used helper functions.
 */
const util = {

  /**
   * Converts the given map to an object. By default runs recursively.
   *
   * @param {Map} map Map object
   * @param {Boolean} deep Recusive. Defaults true.
   * @return {Objecy}
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