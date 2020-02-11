const { resolve } = require('path')
const { assert } = require('chai')
const Cell = require(resolve('lib/operate/cell'))
const VM = require(resolve('lib/operate/vm'))


describe('Cell.fromBPU()', () => {
  it('must convert a BPU cell to an Operate cell', () => {
    const bpu = {
      cell: [
        { i: 0, ii: 1, b: 'MTlIeGlnVjRReUJ2M3RIcFFWY1VFUXlxMXB6WlZkb0F1dA==', s: '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut' },
        { i: 1, ii: 2, b: 'SGVsbG8gd29ybGQ=', s: 'Hello world' },
        { i: 2, ii: 3, b: 'dGV4dC9wbGFpbg==', s: 'text/plain' },
        { i: 3, ii: 4, b: 'dXRmOA==', s: 'utf8' },
        { i: 4, ii: 5, b: 'dGVzdC50eHQ=', s: 'test.txt' },
      ],
      i: 0
    }
    const cell = Cell.fromBPU(bpu)

    assert.instanceOf(cell, Cell)
    assert.equal(cell.ref, '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut')
    assert.deepEqual(cell.params, ['Hello world', 'text/plain', 'utf8', 'test.txt'])
    assert.equal(cell.index, 0)
    assert.equal(cell.dataIndex, 1)
  })
})


describe('Cell#exec()', () => {
  let vm, op;
  before(() => {
    vm = new VM()
    op = `return function(state, y)
            x = state or 0
            y = tonumber(y)
            return math.min(x, y)
          end`;
  })

  it('must return the correct sum', () => {
    const cell = new Cell({ op: "return function(state, a, b) return state + a + b end", params: [3, 5] })
    assert.equal(cell.exec(vm, { state: 1 }), 9)
  })

  it('must return the correct concatenated text', () => {
    const cell = new Cell({ op: "return function(state) return state .. ' world' end", params: [] })
    assert.equal(cell.exec(vm, { state: 'hello' }), 'hello world')
  })

  it('must return a result', () => {
    const cell = new Cell({ op, params: ['2'] })
    assert.equal(cell.exec(vm, { state: 2 }), 2)
  })

  it('must throw an error', () => {
    const cell = new Cell({ op, params: ['2'] })
    assert.throws(_ => {
      cell.exec(vm, { state: { foo: 'bar' } })
    }, /^Lua Error/)
  })
})


describe('Cell#isValid', () => {
  it('must be true for a valid cell', () => {
    const cell = new Cell({ ref: 'abc', op: 'return 123' })
    assert.isTrue(cell.isValid)
  })

  it('must be false for an ivalid cell', () => {
    const cell = new Cell()
    assert.isFalse(cell.isValid)
  })

  it('wont be valid without a ref', () => {
    const cell = new Cell({ op: 'return 123' })
    assert.isFalse(cell.isValid)
  })

  it('wont be valid without an op', () => {
    const cell = new Cell({ ref: 'test' })
    assert.isFalse(cell.isValid)
  })
})