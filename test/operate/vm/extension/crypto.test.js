const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))

let vm, aesKey;
before(() => {
  vm = new VM()
  aesKey = Buffer.from('e18e12b090598ec112edc9546d3e2443e9f4aae9626412c976455bb6f2ffad6a', 'hex')
  vm.set('aes_key', aesKey)
})


describe('Crypto.aesEncrypt() and Crypto.aesDecrypt()', () => {
  xit('must encrypt and decrypt with this aes key', () => {
    const script = `
    enc_data = crypto.aes.encrypt('hello world', aes_key)
    return crypto.aes.decrypt(enc_data, aes_key)
    `
    assert.equal(vm.eval(script), 'hello world')
  })
})