var definer = (function () {
    definer.amd = true;
    definer.config = {
        passArgsWrapper: true,
        loads: [],
        mains: [],
    };
    definer.load = (config = {}) => {
        Object.assign(definer.config, config);
        for (const dep of [...definer.config.loads, ...definer.config.mains]) {
            loadScript(dep, false);
        }
    };
    
    const Modules = {};
    const files = [];
    const ignoreDepLoad = ["require", "module", "exports"];
    const exec = rewind(() => {
        for (const main of definer.config.mains) {
            let module;
            if (main.startsWith("http")) {
                module = getModule(main);
            } else {
                module =
                    location.origin +
                    (main.startsWith("/") ? main : "/" + main);
                module += module.endsWith(".js") ? "" : ".js";
                module = getModule(module);
            }
            if (!module.called) module.execute();
        }
    }, 10);

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
            timeout = setTimeout(()=> {
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

    function basename(path) {
        let u;
        return (
            (u = path.substring(0, path.lastIndexOf("/") || 1)),
            u.endsWith("/") ? u : u.concat("/")
        );
    }

    function join(base, path) {
        let sb = base.split("/").filter((rt) => rt !== "");
        for (let p of path.split("/")) {
            if (p === "..") {
                sb.pop();
            } else if (p !== ".") {
                sb.push(p);
            }
        }
        return (sb[0] !== "/" ? "/" : "") + sb.join("/");
    }

    function loadScript(dep, withInterval = true) {
        let interval = withInterval ? setInterval(()=> exec(), 10) : null;

        const unbind = () => {
            script.removeEventListener("load", load);
            script.removeEventListener("error", error);
            if (withInterval) {
                clearInterval(interval);
                interval = null;
            }
        };

        var load = () => unbind();

        var error = () => {
            unbind();
            console.error("module not found", dep);
        };

        var script = document.createElement("script");
        script.async = true;
        script.src = dep.endsWith(".js") ? dep : dep + ".js";
        script.addEventListener("load", load);
        script.addEventListener("error", error);
        document.body.appendChild(script);
    }

    function loadDeps(module) {
        const relativePath = [];
        for (let path of module.deps) {
            if (ignoreDepLoad.includes(path)) {
                relativePath.push(path);
                continue;
            }

            const noName = path.includes("/");
            let dep = path.startsWith("http")
                ? path
                : noName
                ? module.url.origin.concat(
                      join(basename(module.url.pathname), path)
                  )
                : path;
            if (!dep.endsWith(".js") && noName) dep += ".js";
            relativePath.push(dep);
            if (files.includes(dep)) continue;
            files.push(dep);
            if (!noName) continue;
            loadScript(dep);
        }
        module.deps = relativePath;
    }

    function getArgs(deps, fn) {
        if (typeof deps === "function") {
            fn = deps;
            deps = [];
        }
        return { deps, fn };
    }

    function getFile() {
        let file;
        try {
            throw new Error("");
        } catch (e) {
            file = e.stack
                .split("\n")
                .filter((a) => a.trim().length !== 0)
                .pop()
                .trim()
                .replaceAll(/(\s|\:[\d]\:[\d])/gi, "");
            file = file[0] === "@" ? file.substring(1) : file.substring(2);
        }
        return file;
    }

    function getModule(file) {
        return Modules[file];
    }

    function setModule(file, deps, fn) {
        const url = new URL(file);
        const isLocal = url.host === location.host;
        const module = (Modules[file] = {
            fn,
            deps,
            called: false,
            url,
            isLocal,
            pathname: url.href,
            module: { exports: {} },
            execute(depParent, circular) {
                let args = [];
                for (let dep of this.deps) {
                    if ((circular && dep === depParent) || this.called) {
                        args.push(getModule(dep).module.exports);
                        continue;
                    }
                    
                    if (ignoreDepLoad.includes(dep))
                        args.push(
                            dep === "require"
                                ? require
                                : dep === "module"
                                ? this.module
                                : this.module.exports
                        );
                    else
                        args.push(
                            getModule(dep).execute(
                                this.pathname,
                                dep === depParent
                            )
                        );
                }

                if (!this.called) {
                    this.called = true;
                    this.module.exports =
                        this.fn(
                            ...(definer.config.passArgsWrapper ? args : []),
                            require,
                            this.module,
                            this.module.exports
                        ) ?? this.module.exports;
                }
                return this.module.exports;
            },
        });

        function require(dep) {
            const path = url.origin + join(basename(url.pathname), dep);
            const rm = getModule(path);
            if (!rm)
                return (
                    console.error(
                        `dependency ${path} is not defined! definer(['${dep}'], function(){})`
                    ),
                    void 0
                );
            if (!rm.called)
                console.warn(`Module ${rm.pathname} has not yet been called!`);
            return rm.module.exports;
        }

        Object.defineProperty(require, "imports", {
            get() {
                return module.deps.map((dep) => getModule(dep).module.exports);
            },
        });

        return module;
    }

    function defineModule(dependencies, fnwrapper, name) {
        const file = getFile();
        const { deps, fn } = getArgs(dependencies, fnwrapper);
        const module = setModule(file, deps, fn);
        if (name) Modules[name] = module;
        loadDeps(module);
        exec();
        if (!!!definer.config.mains.length) {
            definer.config.mains.push(module.pathname);
        }
    }

    function definer(dependencies, fnwrapper) {
        defineModule(dependencies, fnwrapper, arguments[2]);
    }

    return definer;
})();

var define = function (name, deps, wrapper) {
    if (typeof name === "function") {
        wrapper = name;
        name = undefined;
        deps = [];
    }

    if (typeof deps === "function") {
        wrapper = deps;
        deps = [];
    }

    if (Array.isArray(name)) {
        deps = name;
        name = undefined;
    }

    definer(deps, wrapper, name);
};

define.amd = {
    jQuery: definer.amd,
};
