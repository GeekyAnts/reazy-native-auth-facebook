'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editAppDelegate;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    (function () {
      var funcOpenLineNumber = 0;
      fileContentsArr.filter(function (word, index) {
        if (word.indexOf('{') !== -1 && index > funcLineNumber && funcOpenLineNumber == 0) {
          funcOpenLineNumber = index;
          return true;
        }
        return false;
      });

      fileContentsArr.splice(funcOpenLineNumber + 1, 0, statement);
    })();
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

function editAppDelegate(filename) {
  if (_fsExtra2.default.existsSync(filename)) {
    var fileContents = _fsExtra2.default.readFileSync(filename, { encoding: 'utf8' });
    var fileContentsArr = fileContents.split('\n');

    fileContentsArr = addHeaderImport(fileContentsArr, '#import <FBSDKCoreKit/FBSDKCoreKit.h>');
    fileContentsArr = addStatementInFunc(fileContentsArr, '(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions', '[[FBSDKApplicationDelegate sharedInstance] application:application\n    didFinishLaunchingWithOptions:launchOptions];');

    fileContentsArr = addFuncLast(fileContentsArr, '\n- (BOOL)application:(UIApplication *)application\n            openURL:(NSURL *)url\n            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n\n  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application\n    openURL:url\n    sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]\n    annotation:options[UIApplicationOpenURLOptionsAnnotationKey]\n  ];\n  // Add any custom logic here.\n  return handled;\n}');

    fileContents = fileContentsArr.join('\n');
    _fsExtra2.default.writeFileSync(filename, fileContents, { encoding: 'utf8' });
  } else {
    console.log('Make sure that the iOS project exists');
    process.exit(1);
  }
}