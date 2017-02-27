import https from 'https';
import fs from 'fs-extra';

export default function downloadFile(hostname, downloadPath, filename, cb) {

  var options = {
    hostname  : hostname,
    port      : 443,
    path      : downloadPath,
    method    : 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    }
  };

  var file = fs.createWriteStream(filename);

  var req = https.request(options, function(res) {
    res.on('data', function(d) {
      file.write(d);
    });
    res.on('end', function() {
      cb();
    });
    res.on('error', function(error) {
      cb(error);
    })
  });
  req.end();
}
