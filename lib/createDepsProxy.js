'use strict';

const isFunction = require('lodash/isFunction');
const debug = require('debug');
const d = debug('breadboard:setup:injector');
const moduleGroupContainsKey =
  (moduleGroup, key) => Object.keys(moduleGroup).some(moduleKey => moduleKey === key);

module.exports = (moduleGroups, options = {}) => {
  const [nativeModules, dependencyModules, appModules] = moduleGroups;
  let mergedDepPaths;
  let finalDeps;

  mergedDepPaths = Object.assign(
    {},
    appModules,
    nativeModules,
    dependencyModules,
    options.substitutes
  );
  
  if (typeof Proxy === 'undefined') throw new Error('Please update to Node 6 : Proxy is not defined');
  
  finalDeps = new Proxy(mergedDepPaths, {
    get(target, moduleKey) {
      let resolvedModule;

      d(`Calling getter for ${moduleKey}`);
      if (options.substitutes && moduleGroupContainsKey(options.substitutes, moduleKey)) {
        resolvedModule = options.substitutes[moduleKey];
      }
      else if (moduleGroupContainsKey(appModules, moduleKey)) {
        let breadboardModule = require(target[moduleKey]);

        if (isFunction(breadboardModule)) {
          resolvedModule = breadboardModule(finalDeps);
        }
        else {
          resolvedModule = breadboardModule;
        }
      }
      else if (moduleKey[0] === '/') {
        throw new Error(`Cannot resolve app module ${moduleKey}`);
      }
      else {
        resolvedModule = require(moduleKey);
      }

      return resolvedModule;
    },
    set() {
      throw new Error('Runtime changes to dependencies not supported');
    }
  });

  return finalDeps;
};
