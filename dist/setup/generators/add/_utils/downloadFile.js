'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = downloadFile;

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function downloadFile(hostname, downloadPath, filename, cb) {

  var options = {
    hostname: hostname,
    port: 443,
    path: downloadPath,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    }
  };

  var file = _fsExtra2.default.createWriteStream(filename);

  var req = _https2.default.request(options, function (res) {
    res.on('data', function (d) {
      file.write(d);
    });
    res.on('end', function () {
      cb();
    });
    res.on('error', function (error) {
      cb(error);
    });
  });
  req.end();
}