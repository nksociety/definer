var definer = this.define = (function (path) {
    let mainFile;
    const Modules = {};

    const exec = rewind(() => invokeModule(Modules[mainFile])&console.log(Modules), 10);

    function rewind(fn, timer) {
        let timeout, params;
        
        function clear() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }

        function init() {
            params = [this, arguments];
            timeout = setTimeout(function () {
                clear();
                const [ctx, args] = params;
                fn.apply(ctx, args);
            }, timer);
        }

        return function () {
            if (timeout) {
                return clear(), init(...arguments);
            }
            init(...arguments);
        };
    }

    function resolveUrl(path) {
        let u;
        return (
            (u = path.substring(0, path.lastIndexOf("/") || 1)),
            u.endsWith("/") ? u : u.concat("/")
        );
    }

    function join(base, path) {
        let sb = base.split("/").filter(rt => rt !== "");
        for (let p of path.split("/")) {
            if (p === "..") {
                sb.pop();
            } else if (p !== ".") {
                sb.push(p);
            }
        }
        return "/" + sb.join("/");
    }

    function loadScript(dep) {
        let interval = setInterval(function () {
            exec();
        }, 10);
        
        const unbind = ()=> {
            script.removeEventListener("load", load);
            script.removeEventListener("error", error);
            clearInterval(interval);
            interval = null;
        }
        
        var load = ()=> {
            unbind()
        }
        
        var error = ()=> {
            unbind()
            console.error("module not found", dep);
        }
        
        var script = document.createElement("script");
        script.async = true;
        script.src = dep;
        script.addEventListener("load", load);
        script.addEventListener("error", error);
        document.body.appendChild(script);
    }

    function loadDeps(base, module) {
        const relativePath = [];
        for (let path of module.deps) {
            const dep = join(base, path);
            relativePath.push(dep);
            loadScript(dep);
        }
        module.deps = relativePath;
    }

    function getArgs(deps, fn) {
        if (typeof deps === "function") {
            fn = deps;
            deps = [];
        }

        return {
            deps,
            fn
        };
    }

    function getFile() {
        let file;
        try {
            throw new Error("");
        } catch (e) {
            file = e.stack
                .split("\n")
                .pop()
                .replaceAll(/(at|[\s]|\:[\d]\:[\d])/gi, "");
        }
        return file;
    }

    function getModule(file) {
        return Modules[file];
    }

    function iterateDeps(dependencies) {
        const depExports = [];
        for (let dependency of dependencies) {
            const { module } = getModule(dependency);
            depExports.push(module.exports);
        }

        for (let dependency of dependencies) {
            invokeModule(getModule(dependency));
        }

        return depExports;
    }

    function invokeModule({ module, deps, fn }) {
        const imports = iterateDeps(deps);
        fn(imports, module.exports);
    }

    function setModule(file, deps, fn) {
        const url = new URL(file);
        const module = (Modules[url.pathname.trim()] = {
            fn,
            deps,
            pathname: url.pathname,
            module: { exports: {} }
        });
        return { module, url };
    }

    function defineModule(dependencies, fnwrapper) {
        const file = getFile();
        const { deps, fn } = getArgs(dependencies, fnwrapper);
        const { module, url } = setModule(file, deps, fn);
        loadDeps(resolveUrl(url.pathname), module);
        exec();
        if (!mainFile) {
            mainFile = url.pathname;
        }
    }

    return function (dependencies, fnwrapper) {
        defineModule(dependencies, fnwrapper, true);
    };
})();

definer.AMD = true;