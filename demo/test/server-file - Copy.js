'use strict';

System.register(['net', 'fs'], function (_export, _context) {
  var net, fs, port;
  return {
    setters: [function (_net) {
      net = _net.default;
    }, function (_fs) {
      fs = _fs.default;
    }],
    execute: function () {
      port = 22112;
    }
  };
});