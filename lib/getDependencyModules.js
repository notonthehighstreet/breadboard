'use strict';

const debug = require('debug');
const stat = require('fs').statSync;
const d = debug('breadboard:setup');

module.exports = (packageDir) => {
  const packageJsonPath = `${packageDir}/package.json`;

  return new Promise((resolve) => {
    let packageJsonModules = {};
    let packageJsonModuleNames;

    try {
      stat(packageJsonPath);
      packageJsonModuleNames = Object.keys(require(packageJsonPath).dependencies);
      packageJsonModules = packageJsonModuleNames.reduce((modules, moduleName) => {
        modules[moduleName] = require.main.require(moduleName);

        return modules;
      }, packageJsonModules);
      d('package.json modules', Object.keys(packageJsonModules));
    }
    catch (e) {
      d('No package.json found');
    }

    return resolve(packageJsonModules);
  });
};
