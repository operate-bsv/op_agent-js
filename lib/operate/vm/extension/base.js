const Extension = require("../extension");
const { encode16, decode16, encode64, decode64 } = require("../../../utils");

class Base extends Extension {
  static extend(vm) {
    vm.setFunction("base.encode16", encode16, { force: true });
    vm.setFunction("base.decode16", decode16);
    vm.setFunction("base.encode64", encode64);
    vm.setFunction("base.decode64", decode64);
  }
}

module.exports = Base;
