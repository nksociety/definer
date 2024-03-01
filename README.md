# definer
define your dependencies and have asynchronous module loading

you can use it with the global variable 'define' or 'definer'

```javascript
definer(['dependency.js', 'dep2.js'], function (require, module, exports) {
    const [dep, dep2] = require.imports;
})
```

in the wrapper you only receive 3 parameters, the imported dependencies and export functionality.

It is loaded asynchronously and the execution of the wrapper is executed once all the dependencies are loaded.

## use
export dependency

```javascript
definer(function (require, module, exports) {
    module.exports = { value: 1 }
})

/// or 

definer(function (require, module, exports) {
    return {
        value: 1
    }
})
```
> [!IMPORTANT]
> Circular dependencies such as "a.js" and "b.js" usually call "a.js" first, 
so you will not get the exports of "b.js" correctly unless it is in a function until 
the exports of "b.js" are added to the dependency on "a.js" see the examples folder.