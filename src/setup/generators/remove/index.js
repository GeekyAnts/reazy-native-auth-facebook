import generators from 'yeoman-generator';
import fs from 'fs';
import path from 'path';
import { removeUse, removeImport } from 'reazy-setup-helper';

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    // const done = this.async();

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    if (!this.pkg || !this.pkg.name) {
      this.log('Please run this command in the root of a Reazy project');
      process.exit(1);
    }

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop()
    };

  },

  writing: function () {
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
