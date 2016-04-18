'use strict';

const debug = require('debug');
const d = debug('breadboard:setup');
const loadSanitisedNativeModules = (modules, nativeModuleName) => {
  const excludedNativesRegExp = /^internal\/|_|v8\//;
  if (!excludedNativesRegExp.test(nativeModuleName)) {
    Object.defineProperty(modules, nativeModuleName, {
      enumerable: true,
      get: () => {
        d(`Requiring ${nativeModuleName}`);

        return require(nativeModuleName);
      }
    });
  }

  return modules;
};
const excludeSubstitutes = (modules, substitutes) => {
  return modules.filter(module => !substitutes.some(substitute => substitute === module));
};

module.exports = (substitutes) => {
  const natives = excludeSubstitutes(Object.keys(process.binding('natives')), substitutes);

  return new Promise((resolve) => {
    const nativeModules = natives.reduce(loadSanitisedNativeModules, {});
    d('Native modules', Object.keys(nativeModules));

    return resolve(nativeModules);
  });
};
