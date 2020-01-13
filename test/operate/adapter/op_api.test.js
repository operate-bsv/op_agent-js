const { resolve } = require('path')
const { assert } = require('chai')
const nock = require('nock')
const OpApi = require(resolve('lib/operate/adapter/op_api'))


describe('OpApi.fetchOps() with array of references', () => {
  before(() => {
    nock('https://api.operatebsv.org/')
      .get(/.*/)
      .once()
      .replyWithFile(200, 'test/mocks/api_fetch_ops.json', {
        'Content-Type': 'application/json',
      })
  })

  it('must return a list of functions', async () => {
    const adapter = new OpApi()
    const ops = await adapter.fetchOps(['9ef5fd5c', '0ca59130'])
    assert.isArray(ops)
    assert.include(ops.map(o => o.ref), '9ef5fd5c')
    assert.include(ops.map(o => o.ref), '0ca59130')
  })
})