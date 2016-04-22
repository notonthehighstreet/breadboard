'use strict';

const debug = require('debug');
const stat = require('fs').statSync;
const resolvePath = require('path').resolve;
const includes = require('lodash/includes');
const d = debug('breadboard:setup:dependencyModules');

module.exports = (packageDir, blacklist, substitutes) => {
  const absolutePackageJsonPath = resolvePath(process.cwd(), `${packageDir}/package.json`);

  return new Promise((resolve, reject) => {
    let dependencyModules = {};
    let packageJsonModuleNames;

    try {
      stat(absolutePackageJsonPath);
      packageJsonModuleNames = Object.keys(require(absolutePackageJsonPath).dependencies);
    }
    catch (e) {
      d('Error getting module dependencies: ', e);
      return reject(e);
    }

    packageJsonModuleNames = packageJsonModuleNames
      .filter((moduleName) => {
        return !includes(blacklist, moduleName);
      })
      .filter((moduleName) => {
        return !includes(substitutes, moduleName);
      });
    dependencyModules = packageJsonModuleNames.reduce((modules, moduleName) => {
      modules[moduleName] = moduleName;

      return modules;
    }, dependencyModules);

    d('package.json modules', Object.keys(dependencyModules));

    return resolve(dependencyModules);
  });
};
