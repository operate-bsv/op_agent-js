const { resolve } = require('path')
const { assert } = require('chai')
const Operate = require(resolve('lib/index'))

describe('Operate', () => {
  describe('#loadTape()', () => {
    it('should be a function', () => {
      assert.typeOf(Operate.loadTape, 'function')
    })
  })

  describe('#runTape()', () => {
    it('should be a function', () => {
      assert.typeOf(Operate.runTape, 'function')
    })
  })
})