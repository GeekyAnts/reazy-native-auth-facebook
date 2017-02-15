# reazy-native-auth-facebook
### Facebook authentication plugin for Reazy apps

---

## Installation

### 1. Using [Reazy CLI](https://www.npmjs.com/package/reazy-cli)

  ```sh
  $ reazy add auth                    // dependency
  $ reazy add native-facebook-auth
  ```

### 2. Manual

  - Install [reazy-auth](https://github.com/GeekyAnts/reazy-auth) which is a dependency of this plugin.

  - Follow [these steps](https://github.com/facebook/react-native-fbsdk) to install react-native-fbsdk.

  - Install reazy-native-auth-facebook
  ```sh
  $ npm install --save reazy-native-auth-facebook
  ```

  - Add these lines to your `src/app.js`
  ```js
  ...
  import auth from 'reazy-auth';
  import authFacebook from 'reazy-native-auth-facebook';   // <-- import the service
  ...
  ...
  app.use(auth(), 'auth');
  app.use(authFacebook({
      auth: app.auth,
  }), 'authFacebook');                                     // <-- Initialize the service
  ...

  export default app;
  ```

  reazy-native-auth-facebook uses reazy-auth to store user details and access token.

## Usage

This service provides the following:

#### login(readPermissions, requestFields)

> Calls `auth.setToken(accessToken)` after successful login and  `auth.setUser(user)` after successful fetching of user.

- readPermissions: *Array<string>*

  List of required [permissions](https://developers.facebook.com/docs/facebook-login/permissions/)

  Example: `['public_profile', 'email']`

- requestFields: *string*

  Fields concatenated with `,` that you want to fetch in the [user object](https://developers.facebook.com/docs/graph-api/reference/user) returned from [graph API](https://developers.facebook.com/docs/graph-api)

  Example: `'name, gender, age_range, first_name, last_name, email'`

- returns a promise which resolves with this object
  ```js
  {
    user: user,              // User object returned from Facebook Graph API
    accessToken: accessToken // Access token returned after successful login
  }
  ```
  and rejects with the error message.

- **Example:**
  ```js
  app.authFacebook.login(['public_profile', 'email'], 'name, email').then((response) => {
    console.log(`Welcome, ${response.user.name}`);
  })
  ```

  After this you can also fetch the user object and token from auth service
  ```js
  const user = app.auth.getUser();  // Assuming that reazy-auth service is registered with name 'auth'
  const accessToken = app.auth.getToken();
  ```

#### logout()

This function logs out the user and calls `auth.setToken(null)` and  `auth.setUser(null)`.

- **Example:**
  ```js
  app.authFacebook.logout();
  ```

#### FBSDK

If you want to do more with FBSDK, this will get you the object imported from [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk).
- **Example:**
  ```js
  const FBSDK = app.authFacebook.FBSDK;
  const {
    ShareDialog,
    LoginManager,
    ShareApi,
    AppEventsLogger,
  } = FBSDK
  ```
