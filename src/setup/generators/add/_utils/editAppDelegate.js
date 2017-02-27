import fs from 'fs-extra';

function addStatementInFunc(fileContentsArr, funcName, statement) {
  let funcLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf(funcName) !== -1) {
      funcLineNumber = index;
      return true;
    }
    return false;
  });

  if(fileContentsArr[funcLineNumber].indexOf('{') !== -1) {
    fileContentsArr.splice(funcLineNumber + 1, 0, statement);
  } else {
    let funcOpenLineNumber = 0;
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
  let classEndLineNumber = 0;
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

  let lastImportLineNumber = 0;
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

export default function editAppDelegate(filename) {
  if (fs.existsSync(filename)) {
    let fileContents = fs.readFileSync(filename, {encoding: 'utf8'});
    let fileContentsArr = fileContents.split('\n');

    fileContentsArr = addHeaderImport(fileContentsArr, `#import <FBSDKCoreKit/FBSDKCoreKit.h>`);
    fileContentsArr = addStatementInFunc(fileContentsArr,
      `(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions`,
      `[[FBSDKApplicationDelegate sharedInstance] application:application
    didFinishLaunchingWithOptions:launchOptions];`);

    fileContentsArr = addFuncLast(fileContentsArr, `
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {

  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application
    openURL:url
    sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
    annotation:options[UIApplicationOpenURLOptionsAnnotationKey]
  ];
  // Add any custom logic here.
  return handled;
}`);

    fileContents = fileContentsArr.join('\n');
    fs.writeFileSync(filename, fileContents, {encoding: 'utf8'});
  } else {
    console.log('Make sure that the iOS project exists');
    process.exit(1);
  }
}
