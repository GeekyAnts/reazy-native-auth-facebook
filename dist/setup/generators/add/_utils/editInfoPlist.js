'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editInfoPlist;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function editInfoPlist(filename) {
  if (_fsExtra2.default.existsSync(filename)) {
    var fileContents = _fsExtra2.default.readFileSync(filename, { encoding: 'utf8' });

    var fileContentsArr = fileContents.split('\n');
    var dictEndLineNumber = 0;
    fileContentsArr.filter(function (word, index) {
      if (word.indexOf('</dict>') !== -1) {
        dictEndLineNumber = index;
        return true;
      }
      return false;
    });

    fileContentsArr.splice(dictEndLineNumber, 0, '  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLSchemes</key>\n      <array>\n        <string>__RN_CONFIG_FACEBOOK_APP_URL_SCHEME</string>\n      </array>\n    </dict>\n  </array>\n  <key>FacebookAppID</key>\n  <string>__RN_CONFIG_FACEBOOK_APP_ID</string>\n  <key>FacebookDisplayName</key>\n  <string>__RN_CONFIG_FACEBOOK_APP_NAME</string>\n  <key>LSApplicationQueriesSchemes</key>\n  <array>\n    <string>fbapi</string>\n    <string>fb-messenger-api</string>\n    <string>fbauth2</string>\n    <string>fbshareextension</string>\n  </array>\n  <key>NSPhotoLibraryUsageDescription</key>\n    <string>{human-readable reason for photo access}</string>');

    fileContents = fileContentsArr.join('\n');
    _fsExtra2.default.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists');
    process.exit(1);
  }
}