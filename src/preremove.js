import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

env.register(__dirname + '/generators/remove', 'reazy-native-auth-facebook-remove');

env.run('reazy-native-auth-facebook-remove', { disableNotifyUpdate: true });
