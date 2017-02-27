import fs from 'fs-extra';
import xcode from 'xcode';

function addGroup(fileContents, groupName, uuid) {
  let fileContentsArr = fileContents.split('\n');
  let mainGroupLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf('mainGroup = ') !== -1) {
      mainGroupLineNumber = index;
      return true;
    }
    return false;
  });

  const mainGroupLineContents = fileContentsArr[mainGroupLineNumber].split(' ');
  const mainGroupId = mainGroupLineContents[mainGroupLineContents.length - 1].replace(';', '');

  let groupIdLineNumber = 0;
  fileContentsArr.filter(function (word, index) {
    if (word.indexOf(mainGroupId + ' = ') !== -1) {
      groupIdLineNumber = index;
      return true;
    }
    return false;
  });

  fileContentsArr.splice(groupIdLineNumber + 3, 0, `${uuid} \/\* ${groupName} \*\/,`);

  fileContents = fileContentsArr.join('\n');
  return fileContents;
}

export default function editPBXProj(filename, projName) {

  if (fs.existsSync(filename)) {

    var myProj = xcode.project(filename);

    const frameworkPaths = [
      '~/Documents/FacebookSDK/Bolts.framework',
      '~/Documents/FacebookSDK/FBSDKCoreKit.framework',
      '~/Documents/FacebookSDK/FBSDKLoginKit.framework',
      '~/Documents/FacebookSDK/FBSDKShareKit.framework',
    ]

    myProj = myProj.parseSync();

    var groupObj = myProj.addPbxGroup(frameworkPaths, 'Frameworks', 'Frameworks', null, true, projName);
    myProj.addBuildPropertyCustom('FRAMEWORK_SEARCH_PATHS', '"~/Documents/FacebookSDK/**"');
    fs.writeFileSync(filename, myProj.writeSync());

    let fileContents = fs.readFileSync(filename, {encoding: 'utf8'})
    fileContents = addGroup(fileContents, 'Frameworks', groupObj.uuid);
    fs.writeFileSync(filename, fileContents, {encoding: 'utf8'});


  } else {
    console.log('Make sure that the iOS project exists and the name in package.json matches the iOS project name');
    process.exit(1);
  }
}
