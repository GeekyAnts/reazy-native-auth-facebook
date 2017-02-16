'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (param) {
  return function (serviceName) {
    var app = this;

    var callGraphApi = function callGraphApi(resolve, reject, requestFields) {
      var _responseInfoCallback = function _responseInfoCallback(error, result) {
        if (error) {
          console.log(error.message);
          reject(error);
        } else {
          param.auth.setUser(result);
          resolve({
            user: result,
            accessToken: param.auth.getToken()
          });
        }
      };
      var infoRequestParams = {
        fields: {
          string: requestFields
        }
      };
      var infoRequestConfig = {
        httpMethod: 'GET',
        version: 'v2.8',
        parameters: infoRequestParams,
        accessToken: param.auth.getToken().toString()
      };
      var infoRequest = new _reactNativeFbsdk.GraphRequest(
      // '/me/photos?type=uploaded&fields=link',
      '/me', infoRequestConfig, _responseInfoCallback);
      // Start the graph request.
      new _reactNativeFbsdk.GraphRequestManager().addRequest(infoRequest).start();
    };

    var login = function login(readPermissions, requestFields) {
      return new Promise(function (resolve, reject) {
        _reactNativeFbsdk.LoginManager.logInWithReadPermissions(readPermissions).then(function (result) {
          if (result.isCancelled) {
            console.warn('reazy-native-auth-facebook: Login cancelled');
          } else {
            // console.log('Login success with permissions: ', result);

            _reactNativeFbsdk.AccessToken.getCurrentAccessToken().then(function (data) {
              if (data.accessToken) {
                param.auth.setToken(data.accessToken);
                callGraphApi(resolve, reject, requestFields);
              } else {
                console.log('access token is null');
              }
            }).catch(function (error) {
              console.log(error, ' :error in Fetching response from Graph API');
            });
          }
        });
      });
    };

    var logout = function logout() {
      _reactNativeFbsdk.LoginManager.logOut();
      param.auth.setUser(null);
      param.auth.setToken(null);
    };

    param.auth.loginFacebook = login;
    param.auth.logoutFacebook = logout;

    var authFacebookService = {
      login: login,
      logout: logout,
      FBSDK: _reactNativeFbsdk2.default
    };

    app.set(serviceName, authFacebookService);

    return authFacebookService;
  };
};

var _reactNativeFbsdk = require('react-native-fbsdk');

var _reactNativeFbsdk2 = _interopRequireDefault(_reactNativeFbsdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }