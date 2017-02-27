import fs from 'fs-extra';

export default function editInfoPlist(filename) {
  if (fs.existsSync(filename)) {
    let fileContents = fs.readFileSync(filename, {encoding: 'utf8'});

    let fileContentsArr = fileContents.split('\n');
    let dictEndLineNumber = 0;
    fileContentsArr.filter(function (word, index) {
      if (word.indexOf('</dict>') !== -1) {
        dictEndLineNumber = index;
        return true;
      }
      return false;
    });

    fileContentsArr.splice(dictEndLineNumber, 0, `  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>__RN_CONFIG_FACEBOOK_APP_URL_SCHEME</string>
      </array>
    </dict>
  </array>
  <key>FacebookAppID</key>
  <string>__RN_CONFIG_FACEBOOK_APP_ID</string>
  <key>FacebookDisplayName</key>
  <string>__RN_CONFIG_FACEBOOK_APP_NAME</string>
  <key>LSApplicationQueriesSchemes</key>
  <array>
    <string>fbapi</string>
    <string>fb-messenger-api</string>
    <string>fbauth2</string>
    <string>fbshareextension</string>
  </array>
  <key>NSPhotoLibraryUsageDescription</key>
    <string>{human-readable reason for photo access}</string>`);

    fileContents = fileContentsArr.join('\n');
    fs.writeFileSync(filename, fileContents, {encoding: 'utf8'});

  } else {
    console.log('Make sure that the iOS project exists');
    process.exit(1);
  }
}
