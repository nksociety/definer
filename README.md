# definer

define your dependencies and have asynchronous module loading

you can use it with the global variable 'define' or 'definer'

```javascript
definer(["dependency.js", "dep2.js"], function (require, module, exports) {
    const [dep, dep2] = require.imports;
});
```

in the wrapper you only receive 3 parameters, the imported dependencies and export functionality.

> [!NOTE]
> If the passArgsWrapper property is set to true the dependencies are passed as arguments to the function. default is true

It is loaded asynchronously and the execution of the wrapper is executed once all the dependencies are loaded.

## use

export dependency

```javascript
definer(function (require, module, exports) {
    module.exports = { value: 1 };
});

/// or

definer(function (require, module, exports) {
    return {
        value: 1,
    };
});
```

## config

```javascript

definer.config = {
    passArgsWrapper: true,
    loads: [],
    mains: [],
};

```

the **loads** and **mains** property receive the url of the scripts
**loads** only adds the scripts and **mains** receives the inputs to be executed

The **passArgsWrapper** property dictates how the properties will be received in the wrapper function

```javascript
// passArgsWrapper = true
definer(['./dep.js'], function(dep) {});

// passArgsWrapper = false
definer(['./dep.js'], function(require) {
    const [dep] = require.imports;
});
```

### load

```javascript
definer.load({
    loads: [],
    mains: ['https://unpkg.com/jquery@3.7.1/src/jquery.js', 'example/main'],
});
```

You can also load modules by url that are execution of main or load as any script

```javascript

definer(['https://unpkg.com/jquery@3.7.1/src/jquery.js'], function ($) {})

```

> [!IMPORTANT]
> Circular dependencies such as "a.js" and "b.js" usually call "a.js" first,
so you will not get the exports of "b.js" correctly unless it is in a function until
the exports of "b.js" are added to the dependency on "a.js" see the examples folder.
