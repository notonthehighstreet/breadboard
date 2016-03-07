'use strict';

const forOwn = require('lodash/forOwn');
const isFunction = require('lodash/isFunction');
const deps = {};

module.exports = (options) => {
  const entry = options.entry;
  const initialState = options.initialState;

  return (moduleGroups) => {
    const nativeModules = moduleGroups[0];
    const nodeModules = moduleGroups[1];
    const customModules = moduleGroups[2];
    let applicationEntry;

    Object.assign(deps, nativeModules, nodeModules);
    forOwn(customModules, (module, path) => {
      deps[path] = isFunction(module) ? module(deps) : module;
    });
    Object.freeze(deps);

    applicationEntry = deps[entry];
    if (isFunction(entry)) {
      applicationEntry = entry(deps);
    }

    return Promise.all([
      applicationEntry(initialState),
      deps
    ]);
  };
};
