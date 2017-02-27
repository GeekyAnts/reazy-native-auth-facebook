'use strict';

var _yeomanGenerator = require('yeoman-generator');

var _yeomanGenerator2 = _interopRequireDefault(_yeomanGenerator);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reazySetupHelper = require('reazy-setup-helper');

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

    this.props = {
      name: this.pkg.name || process.cwd().split(_path2.default.sep).pop()
    };
  },

  writing: function writing() {
    // const appJsPath = this.destinationPath('src/app.js');
    // const envPath = this.destinationPath('.env');
    // const envExamplePath = this.destinationPath('.env.example');
    // const iosProjPath = this.destinationPath('ios', this.props.name + '.xcodeproj', 'project.pbxproj');
    // const androidBuildGradlePath = this.destinationPath('android/app/build.gradle');
    //
    //
    // this.spawnCommandSync('react-native', ['unlink', 'react-native-fbsdk']);
    // this.log('Uninstalling react-native-fbsdk...');
    // this.spawnCommandSync('npm', ['uninstall', '--save', 'react-native-fbsdk']);
    // unlinkIOS(iosProjPath, this.props.name);
    // unlinkAndroid(androidBuildGradlePath);

  }
});