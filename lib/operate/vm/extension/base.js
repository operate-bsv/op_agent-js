const Extension = require("../extension");

class Base extends Extension {
  static extend(vm) {
    vm.setFunction("base.encode16", encode16, { force: true }),
      vm.setFunction("base.decode16", encode16),
      vm.setFunction("base.encode64", encode16),
      vm.setFunction("base.decode64", encode16);
  }

  static encode16(val) {
    if (typeof process === "undefined") {
      var s = unescape(encodeURIComponent(s));
      var h = "";
      for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16);
      }
      return h;
    } else {
      return Buffer.from(val).toString("hex");
    }
  }

  static decode16(val) {
    if (typeof process === "undefined") {
      var s = "";
      for (var i = 0; i < h.length; i += 2) {
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
      }
      return decodeURIComponent(escape(s));
    } else {
      return Buffer.from(val, "hex").toString("utf-8");
    }
  }

  static encode64(val) {
    if (typeof process === "undefined") {
      return window.btoa(val);
    } else {
      return Buffer.from(val).toString("base64");
    }
  }

  static decode64(val) {
    if (typeof process === "undefined") {
      return window.atob(val);
    } else {
      return Buffer.from(val, "base64").toString("utf-8");
    }
  }
}

module.exports = Base;
