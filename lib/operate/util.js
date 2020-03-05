/**
 * TODO
 */
const util = {

  /**
   * TODO
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