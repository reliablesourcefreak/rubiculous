/*
 Rubiculous Runtime Kernel
 Small module registry + execution layer for browser-native subsystem wiring.
*/

window.Rubiculous = window.Rubiculous || {};

(function (R) {
  const modules = {};
  const meta = {};

  R.modules = modules;
  R.meta = meta;

  R.register = function register(name, fn, options) {
    if (!name || typeof fn !== "function") {
      console.warn("Rubiculous.register requires a module name and function:", name);
      return;
    }
    modules[name] = fn;
    meta[name] = Object.assign({ registered: new Date().toISOString() }, options || {});
    return fn;
  };

  R.has = function has(name) {
    return !!modules[name];
  };

  R.run = function run(name, ...args) {
    const mod = modules[name];
    if (!mod) {
      console.warn("Rubiculous module not registered:", name);
      return;
    }
    return mod(...args);
  };

  R.list = function list() {
    return Object.keys(modules);
  };

  R.boot = function boot(sequence) {
    (sequence || []).forEach((name) => {
      try {
        R.run(name);
      } catch (err) {
        console.error("Rubiculous boot failure in module:", name, err);
      }
    });
  };
})(window.Rubiculous);
