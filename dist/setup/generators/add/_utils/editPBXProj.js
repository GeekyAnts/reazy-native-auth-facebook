'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editPBXProj;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _xcode = require('xcode');

var _xcode2 = _interopRequireDefault(_xcode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addGroup(fileContents, groupName, uuid) {
  var fileContentsArr = fileContents.split('\n');
  var mainGroupLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf('mainGroup = ') !== -1) {
      mainGroupLineNumber = index;
      return true;
    }
    return false;
  });

  var mainGroupLineContents = fileContentsArr[mainGroupLineNumber].split(' ');
  var mainGroupId = mainGroupLineContents[mainGroupLineContents.length - 1].replace(';', '');

  var groupIdLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf(mainGroupId + ' = ') !== -1) {
      groupIdLineNumber = index;
      return true;
    }
    return false;
  });

  fileContentsArr.splice(groupIdLineNumber + 3, 0, uuid + ' /* ' + groupName + ' */,');

  fileContents = fileContentsArr.join('\n');
  return fileContents;
}

function editPBXProj(filename, projName) {

  if (_fsExtra2.default.existsSync(filename)) {

    var myProj = _xcode2.default.project(filename);

    var frameworkPaths = ['~/Documents/FacebookSDK/Bolts.framework', '~/Documents/FacebookSDK/FBSDKCoreKit.framework', '~/Documents/FacebookSDK/FBSDKLoginKit.framework', '~/Documents/FacebookSDK/FBSDKShareKit.framework'];

    myProj = myProj.parseSync();

    var groupObj = myProj.addPbxGroup(frameworkPaths, 'Frameworks', 'Frameworks', null, true, projName);
    myProj.addBuildPropertyCustom('FRAMEWORK_SEARCH_PATHS', '"~/Documents/FacebookSDK/**"');
    _fsExtra2.default.writeFileSync(filename, myProj.writeSync());

    var fileContents = _fsExtra2.default.readFileSync(filename, { encoding: 'utf8' });
    fileContents = addGroup(fileContents, 'Frameworks', groupObj.uuid);
    _fsExtra2.default.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists and the name in package.json matches the iOS project name');
    process.exit(1);
  }
}