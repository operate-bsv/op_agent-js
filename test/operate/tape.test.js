const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const Tape = require(resolve('lib/operate/tape'))
const Cell = require(resolve('lib/operate/cell'))
const OpApi = require(resolve('lib/operate/adapter/op_api'))

let cell;
before(() => {
  const op = `return function(ctx, y)
                x = ctx or 0
                return math.pow(x, y)
              end`;
  cell = new Cell({ ref: 'test', params: ["2"], op })
})

describe('Tape.fromBPU()', () => {
  let tx1, tx2;
  before(() => {
    // Fake BPU tx with OP_RETURN output 
    tx1 = { out: [
      { i: 0, tape: [
        { i: 0, cell: [
          { i: 0, ii: 0, b: 'MDAwMDAwMDAwMDAwMDAwMA==', s: '0000000000000000' },
          { i: 1, ii: 1, op: 117, ops: 'OP_DROP' }
        ]}
      ]},
      { i: 1, tape: [
        { i: 0, cell: [
          { i: 0, ii: 0, op: 0, ops: 'OP_FALSE' },
          { i: 1, ii: 1, op: 106, ops: 'OP_RETURN' }
        ]},
        { i: 1, cell: [
          { i: 0, ii: 2, b: 'Zm9v', s: 'foo' },
          { i: 1, ii: 3, b: 'YmFy', s: 'bar' }
        ]},
      ]}
    ]}
    // Fake BPU tx with no OP_RETURN output
    tx2 = { out: [
      { i: 0, tape: [
        { i: 0, cell: [
          { i: 0, ii: 0, b: 'MDAwMDAwMDAwMDAwMDAwMA==', s: '0000000000000000' },
          { i: 1, ii: 1, op: 117, ops: 'OP_DROP' }
        ]}
      ]},
      { i: 1, tape: [
        { i: 0, cell: [
          { i: 0, ii: 0, b: 'MDAwMDAwMDAwMDAwMDAwMA==', s: '0000000000000000' },
          { i: 1, ii: 1, op: 117, ops: 'OP_DROP' }
        ]}
      ]}
    ]}
  })

  it('must return tape from given tx output', () => {
    tape = Tape.fromBPU(tx1, 1)
    assert.instanceOf(tape, Tape)
    assert.lengthOf(tape.cells, 1)
  })

  it('must throw error if given tx output is not op return', () => {
    assert.throws(_ => Tape.fromBPU(tx1, 0), 'No tape found in transaction.')
  })

  it('must throw error if given tx output does not exist', () => {
    assert.throws(_ => Tape.fromBPU(tx1, 3), 'No tape found in transaction.')
  })

  it('must default to first op_return output', () => {
    tape = Tape.fromBPU(tx1)
    assert.instanceOf(tape, Tape)
    assert.lengthOf(tape.cells, 1)
  })

  it('must return error if no op_return output', () => {
    assert.throws(_ => Tape.fromBPU(tx2), 'No tape found in transaction.')
  })
})


describe('Tape#run()', () => {
  xit('must return a tape with result')
  xit('must pipe cells and return a tape with result')
  xit('must pipe cells and return a tape with error')
  xit('must skip errors when strict mode disabled')
})


describe('Tape#setCellOps()', () => {

  let tape, ops;
  before(async () => {
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/api_fetch_ops.json', {
        'Content-Type': 'application/json',
      })
    tape = new Tape({ cells: [
      new Cell({ ref: '9ef5fd5c', params: ['foo.bar', 1, 'foo.baz', 2] }),
      new Cell({ ref: '0ca59130', params: ['baz', 'qux', 3] })
    ]})
    ops = await OpApi.fetchOps(['9ef5fd5c', '0ca59130'])
  })

  it('must return tape with function ops', () => {
    tape.setCellOps(ops)
    assert.match(tape.cells[0].op, /return function\(state/)
    assert.match(tape.cells[1].op, /return function\(state/)
  })

  it('must handle cells with duplicate refs', () => {
    tape = new Tape({ cells: [
      new Cell({ ref: '9ef5fd5c', params: ['foo.bar', 1, 'foo.baz', 2] }),
      new Cell({ ref: '0ca59130', params: ['baz', 'qux', 3] }),
      new Cell({ ref: '0ca59130', params: ['bish', 'bash', 'bosh'] })
    ]})

    assert.isFalse(tape.isValid)
    tape.setCellOps(ops)
    assert.isTrue(tape.isValid)
  })

  it('must handle aliases references', () => {
    tape = new Tape({ cells: [
      new Cell({ ref: 'a' }),
      new Cell({ ref: 'b' }),
      new Cell({ ref: 'c' })
    ]})
    ops = [
      { ref: 'foo', fn: 'return 1' },
      { ref: 'bar', fn: 'return 2' }
    ]
    const aliases = { a: 'foo', b: 'bar', c: 'bar' }
    tape.setCellOps(ops, aliases)

    assert.isTrue(tape.isValid)
    assert.deepEqual(tape.cells.map(c => c.op), ['return 1', 'return 2', 'return 2'])
  })
})


describe('Tape#getOpRefs()', () => {
  it('must return the correct references', () => {
    const tape = new Tape({ cells: [
      new Cell({ ref: 'aabbccdd' }),
      new Cell({ ref: 'eeff1122' }),
      new Cell({ ref: '33445500' })
    ]})
    const aliases = {
      '33445500': 'MyAliasReference'
    }
    assert.deepEqual(tape.getOpRefs(aliases), ['aabbccdd', 'eeff1122', 'MyAliasReference'])
  })
})


describe('Tape#isValid', () => {
  it('must be valid with all ops', () => {
    const tape = new Tape({ cells: [cell, cell] })
    assert.isTrue(tape.isValid)
  })

  it('wont be valid without any ops', () => {
    const tape = new Tape({ cells: [cell, new Cell({ ref: 'test' })] })
    assert.isFalse(tape.isValid)
  })
})