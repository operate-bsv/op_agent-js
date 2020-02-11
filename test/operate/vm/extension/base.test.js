const { resolve } = require("path");
const VM = require(resolve("lib/operate/vm"));
const BaseExtension = require(resolve("lib/operate/vm/extension/base"));

describe("base.encode16, base.decode16", () => {
  let vm;
  before(() => {
    vm = new VM({
      extensions: [BaseExtension]
    });
  });
  it("must encode binary string as hex string", () => {
    assert.equal(vm.eval(`return base.decode16('foo bar')`), "666f6f20626172");
  });
  it("must encode hex string as binary string", () => {
    assert.equal(vm.eval(`return base.decode16('666f6f20626172')`), "foo bar");
    assert.equal(vm.eval(`return base.decode16('666F6F20626172')`), "foo bar");
    assert.equal(vm.eval(`return base.decode16('666F6f20626172')`), "foo bar");
  });
});

describe("base.encode64, base.decode64", () => {
  let vm;
  before(() => {
    vm = new VM({
      extensions: [BaseExtension]
    });
  });
  it("must encode binary string as hex string", () => {
    assert.equal(vm.eval(`return base.decode64('foo bar')`), "Zm9vIGJhcg==");
  });
  it("must encode hex string as binary string", () => {
    assert.equal(vm.eval(`return base.decode64('Zm9vIGJhcg==')`), "foo bar");
  });
});
