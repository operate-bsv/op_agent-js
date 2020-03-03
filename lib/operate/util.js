const util = {

  /**
   * TODO
   */
  mapToObject(map, deep = true) {
    const obj = {}
    for (let [key, val] of map) {
      if (val instanceof Map && deep) {
        obj[key] = mapToObject(val, deep)
      } else {
        obj[key] = val
      }
    }
    return obj
  }

}

module.exports = util