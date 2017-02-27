'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remove = exports.add = undefined;

var _reazySetupHelper = require('reazy-setup-helper');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var add = function add(cb) {
  (0, _reazySetupHelper.runGenerator)(_path2.default.join(__dirname, 'generators', 'add'), 'reazy-native-auth-facebook-add', cb);
};

var remove = function remove(cb) {
  (0, _reazySetupHelper.runGenerator)(_path2.default.join(__dirname, 'generators', 'remove'), 'reazy-native-auth-facebook-remove', cb);
};

exports.add = add;
exports.remove = remove;