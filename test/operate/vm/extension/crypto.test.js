const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))
const interop = require(resolve('lib/operate/vm/interop'))

let vm, aesKey;
before(() => {
  vm = new VM()
  aesKey = Buffer.from('e18e12b090598ec112edc9546d3e2443e9f4aae9626412c976455bb6f2ffad6a', 'hex')
  vm.set('aes_key', interop.wrap(aesKey))
})


describe('Crypto.aesEncrypt() and Crypto.aesDecrypt()', () => {
  it('must encrypt and decrypt with this aes key', async () => {
    const res = await vm.evalAsync(`
    enc_data = crypto.aes.encrypt('hello world', aes_key, { encoding = 'hex' })
    return crypto.aes.decrypt(enc_data, aes_key, { encoding = 'hex' })
    `)
    assert.equal(res, 'hello world')
  })
})


describe('Crypto.hash()', () => {
  it('must create a sha1 hash', async () => {
    const res = await vm.evalAsync(`
    return crypto.hash.sha1('hello world', { encoding = 'hex' })
    `)
    assert.equal(res, '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed')
  })

  it('must create a sha256 hash', async () => {
    const res = await vm.evalAsync(`
    return crypto.hash.sha256('hello world', { encoding = 'hex' })
    `)
    assert.equal(res, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('must create a sha512 hash', async () => {
    const res = await vm.evalAsync(`
    return crypto.hash.sha512('hello world', { encoding = 'hex' })
    `)
    assert.equal(res, '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f')
  })
})