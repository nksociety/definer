definer([
    './src/model.js',
    './src/user.js'
], function (require, module) {
    const [model, user] = require.imports;
    if(!user.getUser()) {
        user.setUser('random_user');
    }
    model.init();
})