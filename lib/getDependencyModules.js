'use strict';

const debug = require('debug');
const stat = require('fs').statSync;
const includes = require('lodash/includes');
const d = debug('breadboard:setup');

module.exports = (packageDir, blacklist, substitutes) => {
  const packageJsonPath = `${packageDir}/package.json`;

  return new Promise((resolve, reject) => {
    let packageJsonModules = {};
    let packageJsonModuleNames;

    try {
      stat(packageJsonPath);
      packageJsonModuleNames = Object.keys(require(packageJsonPath).dependencies);

      d('package.json modules', Object.keys(packageJsonModules));
    }
    catch (e) {
      reject(e);
      d('Error getting module dependencies: ', e);
    }

    packageJsonModuleNames = packageJsonModuleNames
      .filter((moduleName) => {
        return !includes(blacklist, moduleName);
      })
      .filter((moduleName) => {
        return !includes(substitutes, moduleName);
      });
    packageJsonModules = packageJsonModuleNames.reduce((modules, moduleName) => {
      Object.defineProperty(modules, moduleName, {
        get: () => {
          d(`Requiring ${moduleName}`);

          return require.main.require(moduleName);
        },
        enumerable: true
      });

      return modules;
    }, packageJsonModules);

    return resolve(packageJsonModules);
  });
};
