import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

env.register(__dirname + '/generators/add', 'reazy-native-auth-facebook-add');

env.run('reazy-native-auth-facebook-add', { disableNotifyUpdate: true });
