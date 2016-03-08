'use strict';

const debug = require('debug');
const stat = require('fs').statSync;
const includes = require('lodash/includes');
const d = debug('breadboard:setup');

module.exports = (packageDir, blacklist) => {
  const packageJsonPath = `${packageDir}/package.json`;

  return new Promise((resolve) => {
    let packageJsonModules = {};
    let packageJsonModuleNames;

    try {
      stat(packageJsonPath);
      packageJsonModuleNames = Object.keys(require(packageJsonPath).dependencies)
        .filter((moduleName) => {
          return !includes(blacklist, moduleName);
        });
      packageJsonModules = packageJsonModuleNames.reduce((modules, moduleName) => {
        modules[moduleName] = require.main.require(moduleName);

        return modules;
      }, packageJsonModules);
      d('package.json modules', Object.keys(packageJsonModules));
    }
    catch (e) {
      d('Error getting module dependencies: ', e);
    }

    return resolve(packageJsonModules);
  });
};
