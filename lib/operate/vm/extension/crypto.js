const Extension = require("../extension");
const { encode16, decode16, encode64, decode64 } = require("../../../utils");

class Base extends Extension {
  static extend(vm) {
    vm.setFunction("crypto.aes.encrypt", aesEncrypt, { force: true });
    vm.setFunction("crypto.aes.decrypt", aesDecrypt);
    vm.setFunction("crypto.ecies.encrypt", eciesEncrypt);
    vm.setFunction("crypto.ecies.decrypt", eciesDecrypt);
    vm.setFunction("crypto.ecdsa.sign", ecdsaSign);
    vm.setFunction("crypto.ecdsa.verify", ecdsaVerify);
    vm.setFunction("crypto.rsa.encrypt", rsaEncrypt);
    vm.setFunction("crypto.rsa.decrypt", rsaDecrypt);
    vm.setFunction("crypto.rsa.sign", rsaSign);
    vm.setFunction("crypto.rsa.verify", rsaVerify);
    vm.setFunction("crypto.hash.ripemd160", ripemd160);
    vm.setFunction("crypto.hash.sha1", sha1);
    vm.setFunction("crypto.hash.sha256", sha256);
    vm.setFunction("crypto.hash.sha512", sha512);
    vm.setFunction("crypto.bitcoin_message.sign", bitcoinMessageSign);
    vm.setFunction("crypto.bitcoin_message.verify", bitcoinMessageVerify);
  }

  aesEncrypt(data, key, opts = {}) {}

  aesDecrypt(data, key, opts = {}) {}

  eciesEncrypt(data, key, opts = {}) {}

  eciesDecrypt(data, key, opts = {}) {}

  ecdsaSign(data, key, opts = {}) {}

  ecdsaVerify(sig, data, key, opts = {}) {}

  rsaEncrypt(data, key, opts = {}) {}

  rsaDecrypt(data, key, opts = {}) {}

  rsaSign(data, key, opts = {}) {}

  rsaVerify(sig, data, key, opts = {}) {}

  ripemd160(data, key, opts = {}) {}

  sha1(data, key, opts = {}) {}

  sha256(data, key, opts = {}) {}

  sha512(data, key, opts = {}) {}

  bitcoinMessageSign(data, key, opts = {}) {}

  bitcoinMessageVerify(sig, data, key, opts = {}) {}
}

module.exports = Base;
