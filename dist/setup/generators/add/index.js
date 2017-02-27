'use strict';

var _yeomanGenerator = require('yeoman-generator');

var _yeomanGenerator2 = _interopRequireDefault(_yeomanGenerator);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _extractZip = require('extract-zip');

var _extractZip2 = _interopRequireDefault(_extractZip);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _reazySetupHelper = require('reazy-setup-helper');

var _downloadFile = require('./_utils/downloadFile');

var _downloadFile2 = _interopRequireDefault(_downloadFile);

var _editAppDelegate = require('./_utils/editAppDelegate');

var _editAppDelegate2 = _interopRequireDefault(_editAppDelegate);

var _editInfoPlist = require('./_utils/editInfoPlist');

var _editInfoPlist2 = _interopRequireDefault(_editInfoPlist);

var _editPBXProj = require('./_utils/editPBXProj');

var _editPBXProj2 = _interopRequireDefault(_editPBXProj);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _yeomanGenerator2.default.Base.extend({
  constructor: function constructor() {
    _yeomanGenerator2.default.Base.apply(this, arguments);
  },

  initializing: function initializing() {
    // const done = this.async();

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    if (!this.pkg || !this.pkg.name) {
      this.log('Please run this command in the root of a Reazy project');
      process.exit(1);
    }

    // Check Xcode version. Exit if not 8.x.x
    var xcodePath = _shelljs2.default.exec('xcode-select -p', { silent: true }).stdout.split(/[\n\r\s]+/g)[0];
    var xcodeVer = _shelljs2.default.exec(xcodePath + '/usr/bin/xcodebuild -version', { silent: true }).stdout.split(/[\n\r\s]+/g)[1];
    if (xcodeVer.split('.')[0] != 8) {
      this.log('This plugin supports Xcode v8.x.x. Your installed Xcode version is ' + xcodeVer);
      this.log('Please upgrade your Xcode and try again');
      process.exit(1);
    }

    this.props = {
      name: this.pkg.name || process.cwd().split(_path2.default.sep).pop()
    };
  },

  prompting: function prompting() {
    var _this = this;

    var done = this.async();
    var prompts = [{
      name: 'fbAppId',
      message: 'Facebook App ID',
      default: '<your-fb-app-id>'
    }, {
      name: 'fbAppName',
      message: 'Facebook App name',
      default: '<your-fb-app-name>'
    }];

    this.prompt(prompts).then(function (props) {
      _this.log('These config variables will be added to .env file. You can edit them later if you want.');
      _this.props = _lodash2.default.assign(_this.props, props);
      done();
    });
  },

  downloading: function downloading() {
    var done = this.async();
    this.log('\nDownloading FacebookSDK for iOS. This might take a while.');

    var self = this;
    (0, _downloadFile2.default)('origincache.facebook.com', '/developers/resources/?id=FacebookSDKs-iOS-4.18.0.zip', this.templatePath('fbsdk-ios-4.18.0.zip'), function (error) {
      if (error) {
        console.log('Error: ' + error);
      } else {
        console.log('Download complete.\n');
        console.log('Unzipping...');
        (0, _extractZip2.default)(self.templatePath('fbsdk-ios-4.18.0.zip'), { dir: self.templatePath('fbsdk-ios-4.18.0') }, function (err) {
          console.log('Unzipping complete\n');
          done();
        });
      }
    });
  },

  writing: function writing() {
    // Check reazy dependencies
    var authRegName = (0, _reazySetupHelper.getRegistrationName)('reazy-auth');
    if (!authRegName) {
      this.log('Installing Reazy dependencies...');
      this.spawnCommandSync('reazy', ['add', 'auth'], { stdio: 'inherit' });
    }

    var appJsPath = this.destinationPath('src/app.js');
    var envPath = this.destinationPath('.env');
    var iosProjPath = this.destinationPath('ios', this.props.name + '.xcodeproj', 'project.pbxproj');
    var infoPlistPath = this.destinationPath('ios', this.props.name, 'Info.plist');
    var appDelegatePath = this.destinationPath('ios', this.props.name, 'AppDelegate.m');

    this.log('Installing react-native-fbsdk as a project dependency...');
    this.spawnCommandSync('npm', ['install', '--save', 'react-native-fbsdk@0.5.0']);
    this.spawnCommandSync('react-native', ['link', 'react-native-fbsdk']);

    _fsExtra2.default.copySync(this.templatePath('fbsdk-ios-4.18.0'), _path2.default.join(_os2.default.homedir(), 'Documents/FacebookSDK'));
    (0, _editPBXProj2.default)(iosProjPath, this.props.name);
    (0, _editInfoPlist2.default)(infoPlistPath);
    (0, _editAppDelegate2.default)(appDelegatePath);

    (0, _reazySetupHelper.addImport)('reazy-native-auth-facebook', 'authFacebook');
    (0, _reazySetupHelper.addUse)('app.use(authFacebook({\n  auth: app.' + authRegName + ',\n}), \'authFacebook\');');
    (0, _reazySetupHelper.addEnv)('FACEBOOK_APP_ID', this.props.fbAppId);
    (0, _reazySetupHelper.addEnv)('FACEBOOK_APP_URL_SCHEME', 'fb' + this.props.fbAppId);
    (0, _reazySetupHelper.addEnv)('FACEBOOK_APP_NAME', this.props.fbAppName);
  },

  end: function end() {}
});