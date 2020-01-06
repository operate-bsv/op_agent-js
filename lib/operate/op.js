const safeAttrs = ['ref', 'hash', 'name', 'fn']

/**
 * Defines an Op class. Adapters implementing `fetchOps()` should map their 
 * response to Op instances for consitency.
 *
 * @class Op
 */
class Op {
  constructor(attrs = {}) {
    safeAttrs.forEach(a => {
      this[a] = attrs[a]
    })
  }
}

module.exports = Op