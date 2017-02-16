'use strict';

var generators = require('yeoman-generator');
var fs = require('fs-extra');
var path = require('path');
var assign = require('object.assign').getPolyfill();
var transform = require('../../lib/transform');
var xcode = require('xcode');
var os = require('os');
var https = require('https');
var extractZip = require('extract-zip');
var Shell = require('shelljs');

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

  var file = fs.createWriteStream(filename);

  var req = https.request(options, function (res) {
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

function useService(filename, statement) {
  var fileContents = fs.readFileSync(filename, { encoding: 'utf8' }).split('\n');
  var indexOfApp = fileContents.length - 1;
  fileContents.filter(function (word, index) {
    if (word.match(/app.use.*\(.*auth\(\)/g)) {
      indexOfApp = index;
      return true;
    }
    return false;
  });
  fileContents.splice(indexOfApp + 1, 0, '');
  fileContents.splice(indexOfApp + 2, 0, statement);
  fileContents = fileContents.join('\n');
  fs.writeFileSync(filename, fileContents, { encoding: 'utf8' });
}

function importService(filename, name, moduleName) {
  if (fs.existsSync(filename)) {
    var content = fs.readFileSync(filename).toString();
    var ast = transform.parse(content);

    transform.addImport(ast, name, moduleName);

    fs.writeFileSync(filename, transform.print(ast));
  }
}

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

  if (fs.existsSync(filename)) {

    var myProj = xcode.project(filename);

    var frameworkPaths = ['~/Documents/FacebookSDK/Bolts.framework', '~/Documents/FacebookSDK/FBSDKCoreKit.framework', '~/Documents/FacebookSDK/FBSDKLoginKit.framework', '~/Documents/FacebookSDK/FBSDKShareKit.framework'];

    myProj = myProj.parseSync();

    var groupObj = myProj.addPbxGroup(frameworkPaths, 'Frameworks', 'Frameworks', null, true, projName);
    myProj.addBuildPropertyCustom('FRAMEWORK_SEARCH_PATHS', '"~/Documents/FacebookSDK/**"');
    fs.writeFileSync(filename, myProj.writeSync());

    var fileContents = fs.readFileSync(filename, { encoding: 'utf8' });
    fileContents = addGroup(fileContents, 'Frameworks', groupObj.uuid);
    fs.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists and the name in package.json matches the iOS project name');
  }
}

function editInfoPlist(filename) {
  if (fs.existsSync(filename)) {
    var fileContents = fs.readFileSync(filename, { encoding: 'utf8' });

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
    fs.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists');
  }
}

function addHeaderImport(fileContentsArr, importStatement) {

  var lastImportLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf('#import') !== -1) {
      lastImportLineNumber = index;
      return true;
    }
    return false;
  });

  fileContentsArr.splice(lastImportLineNumber + 1, 0, importStatement);

  return fileContentsArr;
}

function addStatementInFunc(fileContentsArr, funcName, statement) {
  var funcLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf(funcName) !== -1) {
      funcLineNumber = index;
      return true;
    }
    return false;
  });

  if (fileContentsArr[funcLineNumber].indexOf('{') !== -1) {
    fileContentsArr.splice(funcLineNumber + 1, 0, statement);
  } else {
    var funcOpenLineNumber = 0;
    fileContentsArr.filter(function (word, index) {
      if (word.indexOf('{') !== -1 && index > funcLineNumber && funcOpenLineNumber == 0) {
        funcOpenLineNumber = index;
        return true;
      }
      return false;
    });

    fileContentsArr.splice(funcOpenLineNumber + 1, 0, statement);
  }

  return fileContentsArr;
}

function addFuncLast(fileContentsArr, funcDef) {
  var classEndLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf('@end') !== -1) {
      classEndLineNumber = index;
      return true;
    }
    return false;
  });

  fileContentsArr.splice(classEndLineNumber, 0, funcDef);

  return fileContentsArr;
}

function editAppDelegate(filename) {
  if (fs.existsSync(filename)) {
    var fileContents = fs.readFileSync(filename, { encoding: 'utf8' });
    var fileContentsArr = fileContents.split('\n');

    fileContentsArr = addHeaderImport(fileContentsArr, '#import <FBSDKCoreKit/FBSDKCoreKit.h>');
    fileContentsArr = addStatementInFunc(fileContentsArr, '(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions', '[[FBSDKApplicationDelegate sharedInstance] application:application\n    didFinishLaunchingWithOptions:launchOptions];');

    fileContentsArr = addFuncLast(fileContentsArr, '\n- (BOOL)application:(UIApplication *)application\n            openURL:(NSURL *)url\n            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n\n  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application\n    openURL:url\n    sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]\n    annotation:options[UIApplicationOpenURLOptionsAnnotationKey]\n  ];\n  // Add any custom logic here.\n  return handled;\n}');

    fileContents = fileContentsArr.join('\n');
    fs.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists');
  }
}

function linkAndroid(filename) {
  if (fs.existsSync(filename)) {
    var fileContents = fs.readFileSync(filename, { encoding: 'utf8' }).split('\n');
    var lineNumber = 0;
    fileContents.filter(function (word, index) {
      if (word.indexOf('apply plugin: "com.android.application"') !== -1) {
        lineNumber = index;
        return true;
      }
      return false;
    });
    fileContents.splice(lineNumber + 1, 0, 'apply from: project(\':react-native-config\').projectDir.getPath() + "/dotenv.gradle"');

    fileContents = fileContents.join('\n');
    fs.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the Android project exists');
  }
}

function addToEnv(filename, content) {
  if (fs.existsSync(filename)) {
    // let fileContents = fs.readFileSync(filename, {encoding: 'utf8'});
    //
    // const lastLinePos = fileContents.lastIndexOf('\n');
    // fileContents = [fileContents.slice(0, lastLinePos), content, fileContents.slice(lastLinePos)].join('');
    //
    // fs.writeFileSync(filename, fileContents, {encoding: 'utf8'});

    fs.appendFileSync(filename, '\n' + content + '\n');
  } else {
    console.log('Make sure that .env file exists');
  }
}

module.exports = generators.Base.extend({
  constructor: function constructor() {
    generators.Base.apply(this, arguments);
  },

  initializing: function initializing() {
    // const done = this.async();

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    if (!this.pkg || !this.pkg.name) {
      this.log('Please run this command in the root of a Reazy project');
      process.exit(1);
    }

    // Check Xcode version. Exit if not 8.x.x
    var xcodePath = Shell.exec('xcode-select -p', { silent: true }).stdout.split(/[\n\r\s]+/g)[0];
    var xcodeVer = Shell.exec(xcodePath + '/usr/bin/xcodebuild -version', { silent: true }).stdout.split(/[\n\r\s]+/g)[1];
    if (xcodeVer.split('.')[0] != 8) {
      this.log('This plugin supports Xcode v8.x.x. Your installed Xcode version is ' + xcodeVer);
      this.log('Please upgrade your Xcode and try again');
      process.exit(1);
    }

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop()
    };
  },

  prompting: function prompting() {
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
      this.log('These config variables will be added to .env file. You can edit that later if you want.');
      this.props = assign(this.props, props);
      done();
    }.bind(this));
  },

  downloading: function downloading() {
    var done = this.async();
    this.log('\nDownloading FacebookSDK for iOS. This might take a while.');

    var self = this;
    downloadFile('origincache.facebook.com', '/developers/resources/?id=FacebookSDKs-iOS-4.18.0.zip', this.templatePath('fbsdk-ios-4.18.0.zip'), function (error) {
      if (error) {
        console.log('Error: ' + error);
      } else {
        console.log('Download complete.\n');
        console.log('Unzipping...');
        extractZip(self.templatePath('fbsdk-ios-4.18.0.zip'), { dir: self.templatePath('fbsdk-ios-4.18.0') }, function (err) {
          console.log('Unzipping complete\n');
          done();
        });
      }
    });
  },

  writing: function writing() {
    var appJsPath = this.destinationPath('src/app.js');
    var envPath = this.destinationPath('.env');
    var iosProjPath = this.destinationPath('ios', this.props.name + '.xcodeproj', 'project.pbxproj');
    var infoPlistPath = this.destinationPath('ios', this.props.name, 'Info.plist');
    var appDelegatePath = this.destinationPath('ios', this.props.name, 'AppDelegate.m');
    var androidBuildGradlePath = this.destinationPath('android/app/build.gradle');

    this.log('Installing react-native-fbsdk as a project dependency...');
    this.npmInstall(['react-native-fbsdk@0.5.0'], { save: true });
    this.spawnCommandSync('react-native', ['link', 'react-native-fbsdk']);

    fs.copySync(this.templatePath('fbsdk-ios-4.18.0'), path.join(os.homedir(), 'Documents/FacebookSDK'));
    editPBXProj(iosProjPath, this.props.name);
    editInfoPlist(infoPlistPath);
    editAppDelegate(appDelegatePath);
    // linkAndroid(androidBuildGradlePath);

    // Automatically import the new service into services/index.js and initialize it.
    importService(appJsPath, 'authFacebook', 'reazy-native-auth-facebook');
    useService(appJsPath, 'app.use(authFacebook({\n  auth: app.auth,\n}), \'authFacebook\');');
    addToEnv(envPath, 'FACEBOOK_APP_ID=' + this.props.fbAppId);
    addToEnv(envPath, 'FACEBOOK_APP_URL_SCHEME=fb' + this.props.fbAppId);
    addToEnv(envPath, 'FACEBOOK_APP_NAME=' + this.props.fbAppName);
  }
});