const { resolve } = require('path')
const { assert } = require('chai')
const VM = require(resolve('lib/operate/vm'))
const interop = require(resolve('lib/operate/vm/interop'))

let vm
before(() => {
  vm = new VM()
})


describe('CryptoExt.aesEncrypt() and CryptoExt.aesDecrypt()', () => {
  before(() => {
    vm.set('aes_key', interop.wrap({
      kty: 'oct',
      alg: 'A256GCM',
      key_ops: ['encrypt', 'decrypt'],
      k: '4Y4SsJBZjsES7clUbT4kQ-n0quliZBLJdkVbtvL_rWo'
    }))
  })

  it('must encrypt and decrypt with the aes key', async () => {
    const res = await vm.evalAsync(`
    enc_data = crypto.aes.encrypt('hello world', aes_key)
    return crypto.aes.decrypt(enc_data, aes_key)
    `)
    assert.equal(res, 'hello world')
  })
})


describe('CryptoExt.eciesEncrypt() and CryptoExt.eciesDecrypt()', () => {
  before(() => {
    vm.set('ecdsa_pub_key', interop.wrap(
      Buffer.from('0296207d8752d01b1cf8de77d258c02dd7280edc2bce9b59023311bbd395cbe93a', 'hex')
    ))
    vm.set('ecdsa_priv_key', interop.wrap(
      Buffer.from('bd8a6a5d1630b0da3d5424ebab18f69f18226d32dd1c884e78b83cdddf839e2c', 'hex')
    ))
  })

  it('must encrypt with public key and decrypt with private key', async () => {
    const res = await vm.evalAsync(`
    enc_data = crypto.ecies.encrypt('hello world', ecdsa_pub_key)
    return crypto.ecies.decrypt(enc_data, ecdsa_priv_key)
    `)
    assert.equal(res, 'hello world')
  })
})


describe('CryptoExt.ecdsaSign() and CryptoExt.ecdsaVerify()', () => {
  before(() => {
    vm.set('ecdsa_pub_key', interop.wrap(
      Buffer.from('0296207d8752d01b1cf8de77d258c02dd7280edc2bce9b59023311bbd395cbe93a', 'hex')
    ))
    vm.set('ecdsa_priv_key', interop.wrap(
      Buffer.from('bd8a6a5d1630b0da3d5424ebab18f69f18226d32dd1c884e78b83cdddf839e2c', 'hex')
    ))
  })

  it('must sign and verify message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.ecdsa.sign('hello world', ecdsa_priv_key)
    return crypto.ecdsa.verify(sig, 'hello world', ecdsa_pub_key)
    `)
    assert.isTrue(res)
  })

  it('wont verify when different message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.ecdsa.sign('hello world', ecdsa_priv_key)
    return crypto.ecdsa.verify(sig, 'goodbye world', ecdsa_pub_key)
    `)
    assert.isFalse(res)
  })
})


describe('CryptoExt.rsaEncrypt() and CryptoExt.rsaDecrypt()', () => {
  before(() => {
    vm.set('rsa_pub_key', interop.wrap({
      kty: 'RSA',
      alg: 'RSA-OAEP-256',
      key_ops: ['encrypt'],
      e: 'AQAB',
      n: '5tGF6LEeiuRFgu8EXbB9Zwus_U3P8nrRjvhGdndE7_wKRADkIU_tIhqok1YSZlhGvQK-v219__oHPp2AHPe6GLUEwnkOzk3Id8RM-QwtYj4AkQ86gxvr_M79MgKZ7IWlPN4_c4vEvo4bgxU8_EvVh0S8eN-f8g_gjddsGSkmwwgOG4HzX2PsxRcmwNKCF4MnLsmXRZyN_IwIUG2lDX2Fc-v-ByEx0ZXsXOOzHEECheB5eOjAJGtDk10j5yRvH83xb-fPjaPpTJQvs79QrXrSfQK7N_CzVcNX5ebVnvANp5CoHg-51UWlcDOf06dJ5UFOwx_-zkXfpLxwIpCBt6d77w'
    }))
    vm.set('rsa_priv_key', interop.wrap({
      kty: 'RSA',
      alg: 'RSA-OAEP-256',
      key_ops: ['decrypt'],
      e: 'AQAB',
      n: '5tGF6LEeiuRFgu8EXbB9Zwus_U3P8nrRjvhGdndE7_wKRADkIU_tIhqok1YSZlhGvQK-v219__oHPp2AHPe6GLUEwnkOzk3Id8RM-QwtYj4AkQ86gxvr_M79MgKZ7IWlPN4_c4vEvo4bgxU8_EvVh0S8eN-f8g_gjddsGSkmwwgOG4HzX2PsxRcmwNKCF4MnLsmXRZyN_IwIUG2lDX2Fc-v-ByEx0ZXsXOOzHEECheB5eOjAJGtDk10j5yRvH83xb-fPjaPpTJQvs79QrXrSfQK7N_CzVcNX5ebVnvANp5CoHg-51UWlcDOf06dJ5UFOwx_-zkXfpLxwIpCBt6d77w',
      d: 'm7Z1lAkJBcIBctc0JtBNiRrDVQ8NXhOlE8JCJuFHTG7HriC7xg1ZeExrtRm3x_t9nT0g2ZtQCUPvZzpxlxk4HjrgPyHT7zFiMAnps4mXhFM3pqSTYKeRiDdLcFV46asvUeTNAXIlBDhyLvhA8CNopZylWRXjnTVA0--kKUUttRuNoerdNtdJm4A3GU_Mf4Vu_uePz2JGLwHAenHlMlulNPp8FrG_vhGmLRp9jpAb82W57RLBhlXZ3hQk1P9g0twhFW6kt-npJ25_0o-ym4aOTcavOfiiWdsKQ85SnZWQ4ipblhCzy-JWZX55pr_YknRyEdvTu0FTX5If3TwCxrM7YQ',
      p: '_8EZnbAShnu35KlmAyV74rgtxnAHwRRtyfhwe5QaZHIJSeos6g3FQTryz4rmai50czEJr3j-Y1_yPA1qlMqyU7N2zUeSrBYaAyoSZCJZ_P5uNV0IFJLItlvezf8bH4MFXgf6mXrfBNv8tqtz_bNxyjR5osyIIb8pofnKSqM5420',
      q: '5wpKUqn87aW0eeC5PcwOXQMcyM2xxBMs0JrpLRALpuAGmN5olNihAF9uDzhtvBrqVnLI9FBn2UC_LBOavKZrzOIUcc2LdEg-bC2up4EvdhGUAeztyIG53y154DpQwi85zGNqduE1oNWvm77U64G16_VV15OmcxqySNj2NHhVZ0s',
      dp: 'l6MdFgKUKUpnUNsjUdBCsLz03wgDgPYk1jBIOO0p7M40Na_zq144yyExX96CGQisILQ9gt2hLrhvfi2SOOApdTkdwj6idwevqpqiRt6bLkaIf3lGVjRlbsHvy4Fqync7knH2olNYsZ_hKUlkv1JKsFIGoIDWYfPeslvRFgnLQ80',
      dq: 'vz8EYML3bBxzdUOw8td7uECATjP-h2i7-v2QMM4MZxkgPOA1v6hGNZHI_-5c342EFwUzFRGNtQdkd-7OcoRrzZADDmTvn9TBXzi9T0ifaeOJGcLu3b-MhZIWRabf_K2s8WQF19v6UWUw1QI1K7EWTvipEybUbIlXtPdrbemCAFs',
      qi: '6n8D58ReeysnLb0VVr-KrgUL5XoVujzueJBYLHMGi6N7yyk9Mp878dI_g0RKV_e4qedbRylvJBfAQAI01TjKskvLCjmr3X2ZEpY3cLXosA11sc0thzV_kD65bARP8cBdB5-rqJEPNLvFX2nw8N30g9d03r-jIw7xyEq7AKP9kw8'
    }))
  })

  it('must encrypt with public key and decrypt with private key', async () => {
    const res = await vm.evalAsync(`
    enc_data = crypto.rsa.encrypt('hello world', rsa_pub_key)
    return crypto.rsa.decrypt(enc_data, rsa_priv_key)
    `)
    assert.equal(res, 'hello world')
  })
})


describe('CryptoExt.rsaSign() and CryptoExt.rsaVerify()', () => {
  before(() => {
    vm.set('rsa_pub_key', interop.wrap({
      kty: 'RSA',
      alg: 'PS256',
      key_ops: ['verify'],
      e: 'AQAB',
      n: 'xR74jMgiq8qK9ecr-pbK_490RUH8REZrz0ddcqnHVxFYhtkFL61kllOs03p4-hz91Bnzge4QGz9TKu9Icm1LBiBS66vjlNH9Exgvg1l6lbkABD7angmLaL7Orupv2cAiwZadYdBWPwE0D4R8QJA2xA-kx0xFtPEIRGS5_dOj-vibLq8rQuwS8jWVVtT8u7M2MGIuzupkOBRkoOKkCsGQ0dzjawAU1mgtLfy3MqvK8qoTKkRiT-Aj-vPucqU8Tpj_6l7CBoktSQi6CzzeGvA5OGvcvF7qX6CGdPRp72JNuqvMD9tRK0TJncZuD2zLIXOh7C4Qg0IyTZTSV6QuoV7zPQ'
    }))
    vm.set('rsa_priv_key', interop.wrap({
      kty: 'RSA',
      alg: 'PS256',
      key_ops: ['sign'],
      e: 'AQAB',
      n: 'xR74jMgiq8qK9ecr-pbK_490RUH8REZrz0ddcqnHVxFYhtkFL61kllOs03p4-hz91Bnzge4QGz9TKu9Icm1LBiBS66vjlNH9Exgvg1l6lbkABD7angmLaL7Orupv2cAiwZadYdBWPwE0D4R8QJA2xA-kx0xFtPEIRGS5_dOj-vibLq8rQuwS8jWVVtT8u7M2MGIuzupkOBRkoOKkCsGQ0dzjawAU1mgtLfy3MqvK8qoTKkRiT-Aj-vPucqU8Tpj_6l7CBoktSQi6CzzeGvA5OGvcvF7qX6CGdPRp72JNuqvMD9tRK0TJncZuD2zLIXOh7C4Qg0IyTZTSV6QuoV7zPQ',
      d: 'CIUAqBEEUplz7RHbOD7pMidwloe2D_tdMH28n7aPy4cP5PAfRcLAPLEMIK3D6cdz_wVKHXz9DDht70adQnjPy8l82_u3X9i9j-Q1NX-aCTuQMR7IUxlFgbbxduTiBa7EscpBLheTirCSH_ORbTbubwXgEM8OmjXqrg4ObdaGWVPu6byvxi7L2LrLoon3FvCuyorZ6_t27mU1_lHbDVsZUAVHUElUZY_O0rMzQ-dTZgWYpNSoJ4qqpn9XWd0cW2ZglhzMct9CMFtB19edaMTqkpTox4NQvPsgEPpVsUi2YW7hfmWrVio3PesXxHMt1KMFMG_NvEDVijh4SZtonGZNAQ',
      p: '7gIMV78xK90P2VA9I2g4kx0ZdF-BrV2TalKN62H0OPOPvY3_bu8sEYVp5X64TnAPP3OwkCpxaVOAj2uYysIpFk50bAEH4XEg_WoOdSNpt-ggs460rOslbH0fkyQn4e1A1qx_FesO2R7FB9uqt7M785Z0Vl_fORdfayDrkDpoEYE',
      q: '1AWsZ8tCVW8EWfqb2_SldLxH6wd7nIVDWVZX2drQQ-3LD8J2k6gKgAY0YC1HA9J0oG3uKBRGzyfKVHrUBtrGaC-90Y4MvxEezhvrpFtR9reCNuxP4g31J5sn-Ql2jcWfHThqTz1b6EJrwlcZ8dN0v4LHw_wFIg7wFNNr6XrPh70',
      dp: 'jhee8svsOTmy-pRSy86u5_VZewaBztSs6675l2tVeKLAT_R0aPBVKOizfhWXRwzTrZgN8yPDrZPyjq03_OTJzs1r6Ab9g3Qcs-4bT4ei1-63hztNVmbUYt6YeSn-vXz9VqyI-rbomGssSjK0yxMwWY6bSe3WwKjZiIWQ3PxhoQE',
      dq: 'bDgVHsltq0PGGdNDuIpv5Vyw7LLeEi8nCDN9FdKNGQ8H5Zxhf852xY_lLe4OYFIMe1KBC-4FknkB2grzrCgAu28a2RpDQUcQzS0NItAFzwMtsLD_uSdcqYGVbpS48XYcWALSqG1uOuekLwbcVEWVQqcTJeK-D_tF6atcWkj4IpU',
      qi: 'XAVrKASuH3_DnmK6is27Eot16a_aRKOCYqk51D7uAtrnznjH2Z1WP_RFkcXXsqXVcHoCRCzj3VAtaD1bdkQUYGcGBpb3CSFu8qna3ZSP5dkUFUd01VSP206pmPNqLoiooaAIWQVXNRD8SSl70OTQqLbgSlQEmgsL5GjAhZRn1Bo'
    }))
  })

  it('must sign and verify message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.rsa.sign('hello world', rsa_priv_key)
    return crypto.rsa.verify(sig, 'hello world', rsa_pub_key)
    `)
    assert.isTrue(res)
  })

  it('wont verify when different message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.rsa.sign('hello world', rsa_priv_key)
    return crypto.rsa.verify(sig, 'goodbye world', rsa_pub_key)
    `)
    assert.isFalse(res)
  })
})


describe('CryptoExt.bitcoinMessageSign() and CryptoExt.bitcoinMessageVerify()', () => {
  before(() => {
    vm.set('bsv_pub_key', interop.wrap(
      Buffer.from('0296207d8752d01b1cf8de77d258c02dd7280edc2bce9b59023311bbd395cbe93a', 'hex')
    ))
    vm.set('bsv_priv_key', interop.wrap(
      Buffer.from('bd8a6a5d1630b0da3d5424ebab18f69f18226d32dd1c884e78b83cdddf839e2c', 'hex')
    ))
    vm.set('bsv_address', '15KgnG69mTbtkx73vNDNUdrWuDhnmfCxsf')
  })

  it('must sign and verify message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.bitcoin_message.sign('hello world', bsv_priv_key)
    return crypto.bitcoin_message.verify(sig, 'hello world', bsv_pub_key)
    `)
    assert.isTrue(res)
  })

  it('must verify message with address', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.bitcoin_message.sign('hello world', bsv_priv_key)
    return crypto.bitcoin_message.verify(sig, 'hello world', bsv_address)
    `)
    assert.isTrue(res)
  })

  it('wont verify when different message', async () => {
    const res = await vm.evalAsync(`
    sig = crypto.bitcoin_message.sign('hello world', bsv_priv_key)
    return crypto.bitcoin_message.verify(sig, 'goodbye world', bsv_pub_key)
    `)
    assert.isFalse(res)
  })
})


describe('CryptoExt.hash()', () => {
  it('must create a ripemd160 hash', async () => {
    const res = await vm.evalAsync("return crypto.hash.ripemd160('hello world')")
    assert.equal(res.toString('hex'), '98c615784ccb5fe5936fbc0cbe9dfdb408d92f0f')
  })

  it('must create a sha1 hash', async () => {
    const res = await vm.evalAsync("return crypto.hash.sha1('hello world')")
    assert.equal(res.toString('hex'), '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed')
  })

  it('must create a sha256 hash', async () => {
    const res = await vm.evalAsync("return crypto.hash.sha256('hello world')")
    assert.equal(res.toString('hex'), 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('must create a sha512 hash', async () => {
    const res = await vm.evalAsync("return crypto.hash.sha512('hello world')")
    assert.equal(res.toString('hex'), '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f')
  })
})
