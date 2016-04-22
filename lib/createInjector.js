'use strict';

const forOwn = require('lodash/forOwn');
const isFunction = require('lodash/isFunction');
const debug = require('debug');
const d = debug('breadboard:setup:injector');
const createModuleGetter = (moduleKey, modulePath, appModules, breadboardDeps) => {
  return () => {
    d(`Calling getter for ${moduleKey}`);
    if (Object.keys(appModules).some(appModuleKey => moduleKey === appModuleKey)) {
      let breadboardModule = require(modulePath);

      if (isFunction(breadboardModule)) {
        return breadboardModule(breadboardDeps);
      }
      else {
        return breadboardModule;
      }
    }
    else {
      return require.main.require(moduleKey);
    }
  };
};

module.exports = (options) => {
  const mergedDepPaths = {};
  const finalDeps = {};
  const entry = options.entry;
  const initialState = options.initialState;

  if (!entry) {
    throw new Error('Expected application entry point to be specified');
  }

  return (moduleGroups) => {
    const nativeModules = moduleGroups[0];
    const dependencyModules = moduleGroups[1];
    const appModules = moduleGroups[2];
    let applicationEntry;

    Object.assign(mergedDepPaths, appModules, nativeModules, dependencyModules, options.substitutes);
    forOwn(mergedDepPaths, (modulePath, moduleKey) => {
      Object.defineProperty(finalDeps, moduleKey, {
        enumerable: true,
        get: createModuleGetter(
          moduleKey,
          modulePath,
          appModules,
          finalDeps
        )
      });
    });
    Object.freeze(finalDeps);
    applicationEntry = finalDeps[entry];
    if (isFunction(entry)) {
      applicationEntry = entry(finalDeps);
    }

    return Promise.all([
      applicationEntry(initialState),
      finalDeps
    ]);
  };
};
