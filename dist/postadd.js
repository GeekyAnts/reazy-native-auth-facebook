'use strict';

var _yeomanEnvironment = require('yeoman-environment');

var _yeomanEnvironment2 = _interopRequireDefault(_yeomanEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var env = _yeomanEnvironment2.default.createEnv();

env.register(__dirname + '/generators/add', 'reazy-native-auth-facebook-add');

env.run('reazy-native-auth-facebook-add', { disableNotifyUpdate: true });
//# sourceMappingURL=postadd.js.map