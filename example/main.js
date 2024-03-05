definer([
    './src/model.js',
    './src/user.js',
    'jquery'
], function (model, user, $, require, module) {
    console.log($('body'))
    if(!user.getUser()) {
        user.setUser('random_user');
    }
    model.init();
})