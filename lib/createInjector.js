'use strict';

const forOwn = require('lodash/forOwn');
const isFunction = require('lodash/isFunction');
const debug = require('debug');
const d = debug('breadboard:setup');

module.exports = (options) => {
  const deps = {};
  const entry = options.entry;
  const initialState = options.initialState;

  return (moduleGroups) => {
    d('Building dependencies');

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
