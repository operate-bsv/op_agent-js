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
      if (val instanceof Map && deep) {
        obj[key] = this.mapToObject(val, deep)
      } else {
        obj[key] = val
      }
    }
    return obj
  }

}

module.exports = util