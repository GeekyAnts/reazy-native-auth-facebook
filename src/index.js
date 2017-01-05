import Fbsdk, { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

export default function(param) {
  return function(serviceName) {
    const app = this;

    const callGraphApi = (resolve, reject, requestFields) => {
      const _responseInfoCallback = (error, result) => {
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
      }
      const infoRequestParams = {
        fields: {
          string: requestFields
        }
      }
      const infoRequestConfig = {
        httpMethod: 'GET',
        version: 'v2.8',
        parameters: infoRequestParams,
        accessToken: param.auth.getToken().toString()
      }
      const infoRequest = new GraphRequest(
        // '/me/photos?type=uploaded&fields=link',
        '/me',
        infoRequestConfig,
        _responseInfoCallback
      );
      // Start the graph request.
      new GraphRequestManager().addRequest(infoRequest).start();
    };

    const login = (readPermissions, requestFields) => {
      return new Promise(function(resolve, reject) {
        LoginManager.logInWithReadPermissions(readPermissions)
        .then((result) => {
          console.log(result);
          if (result.isCancelled) {
            // console.log('Login cancelled');
          } else {
            // console.log('Login success with permissions: ', result);

            AccessToken.getCurrentAccessToken()
            .then((data) => {
              if (data.accessToken) {
                param.auth.setToken(data.accessToken);
                callGraphApi(resolve, reject, requestFields);
              } else {
                console.log('access token is null');
              }
            })
            .catch((error) => {
              console.log(error, ' :error in Fetching response from Graph API');
            });
          }
        });
      });
    }

    const logout = () => {
      LoginManager.logOut();
      param.auth.setUser(null);
      param.auth.setToken(null);
    };

    param.auth.loginFacebook = login;
    param.auth.logoutFacebook = logout;

    const authFacebookService = {
      login,
      logout,
      Fbsdk,
    };

    app.set(serviceName, authFacebookService);

    return authFacebookService;
  }
}
