import generators from 'yeoman-generator';
import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import os from 'os';
import extractZip from 'extract-zip';
import Shell from 'shelljs';
import { getRegistrationName, addEnv, addImport, addUse } from 'reazy-setup-helper';
import downloadFile from './_utils/downloadFile';
import editAppDelegate from './_utils/editAppDelegate';
import editInfoPlist from './_utils/editInfoPlist';
import editPBXProj from './_utils/editPBXProj';

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

    // Check Xcode version. Exit if not 8.x.x
    const xcodePath = Shell.exec('xcode-select -p', { silent: true }).stdout.split(/[\n\r\s]+/g)[0];
    const xcodeVer = Shell.exec(xcodePath + '/usr/bin/xcodebuild -version', { silent: true }).stdout.split(/[\n\r\s]+/g)[1];
    if(xcodeVer.split('.')[0] != 8) {
      this.log('This plugin supports Xcode v8.x.x. Your installed Xcode version is ' + xcodeVer);
      this.log('Please upgrade your Xcode and try again');
      process.exit(1);
    }

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop()
    };

  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        name: 'fbAppId',
        message: 'Facebook App ID',
        default: '<your-fb-app-id>'
      },
      {
        name: 'fbAppName',
        message: 'Facebook App name',
        default: '<your-fb-app-name>'
      },
    ];

    this.prompt(prompts).then((props) => {
      this.log('These config variables will be added to .env file. You can edit them later if you want.')
      this.props = _.assign(this.props, props);
      done();
    });
  },

  downloading: function () {
    var done = this.async();
    this.log('\nDownloading FacebookSDK for iOS. This might take a while.');

    var self = this;
    downloadFile(
      'origincache.facebook.com',
      '/developers/resources/?id=FacebookSDKs-iOS-4.18.0.zip',

      this.templatePath('fbsdk-ios-4.18.0.zip'),

      function (error) {
        if(error) {
          console.log('Error: ' + error);
        } else {
          console.log('Download complete.\n');
          console.log('Unzipping...');
          extractZip(self.templatePath('fbsdk-ios-4.18.0.zip'), {dir: self.templatePath('fbsdk-ios-4.18.0')}, function (err) {
            console.log('Unzipping complete\n');
            done();
          })
        }
      }
    );
  },

  writing: function () {
    // Check reazy dependencies
    const authRegName = getRegistrationName('reazy-auth');
    if(!authRegName) {
      this.log('Installing Reazy dependencies...')
      this.spawnCommandSync('reazy', ['add', 'auth'], { stdio: 'inherit' });
    }

    const appJsPath = this.destinationPath('src/app.js');
    const envPath = this.destinationPath('.env');
    const iosProjPath = this.destinationPath('ios', this.props.name + '.xcodeproj', 'project.pbxproj');
    const infoPlistPath = this.destinationPath('ios', this.props.name, 'Info.plist');
    const appDelegatePath = this.destinationPath('ios', this.props.name, 'AppDelegate.m');

    this.log('Installing react-native-fbsdk as a project dependency...');
    this.spawnCommandSync('npm', ['install', '--save', 'react-native-fbsdk@0.5.0']);
    this.spawnCommandSync('react-native', ['link', 'react-native-fbsdk']);

    fs.copySync(this.templatePath('fbsdk-ios-4.18.0'), path.join(os.homedir(), 'Documents/FacebookSDK'));
    editPBXProj(iosProjPath, this.props.name);
    editInfoPlist(infoPlistPath);
    editAppDelegate(appDelegatePath);

    addImport('reazy-native-auth-facebook', 'authFacebook');
    addUse(`app.use(authFacebook({
  auth: app.${authRegName},
}), 'authFacebook');`);
    addEnv('FACEBOOK_APP_ID', this.props.fbAppId);
    addEnv('FACEBOOK_APP_URL_SCHEME', 'fb' + this.props.fbAppId);
    addEnv('FACEBOOK_APP_NAME', this.props.fbAppName);
  },

  end: function() {

  }
});
