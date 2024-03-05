definer(['./model.js'], function (model,require, module, exports) {
    //const [model] = require.imports;
    
    exports.click = function () {
        model.setItem(model.input.value);
        model.input.value = '';
    }
})