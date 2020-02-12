function encode16(val) {
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

function decode16(val) {
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

function encode64(val) {
  if (typeof process === "undefined") {
    return window.btoa(val);
  } else {
    return Buffer.from(val).toString("base64");
  }
}

function decode64(val) {
  if (typeof process === "undefined") {
    return window.atob(val);
  } else {
    return Buffer.from(val, "base64").toString("utf-8");
  }
}

module.exports = {
  encode16,
  decode16,
  encode64,
  decode64
};
