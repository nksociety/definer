# definer
define your dependencies and have asynchronous module loading

you can use it with the global variable 'define' or 'definer'

```javascript
definer(['dependency.js', 'dep2.js'], function (imports, exports) {
    const [dep, dep2] = imports;
})
```

in the wrapper you only receive 2 parameters, the imported dependencies and export functionality.

It is loaded asynchronously and the execution of the wrapper is executed once all the dependencies are loaded.