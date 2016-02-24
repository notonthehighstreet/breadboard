'use strict';

const parse = require('path').parse;
const relative = require('path').relative;
const join = require('path').join;
const walk = require('walk').walk;
const forOwn = require('lodash/forOwn');
const isFunction = require('lodash/isFunction');
const debug = require('debug');

const deps = {};
const d = debug('breadboard:setup');
const e = debug('breadboard:error');
const getModuleKey = (containerRoot, absolutePathToModule, parsedModulePath) => {
  const relativeModulePath = relative(containerRoot, absolutePathToModule);
  const moduleKey = '/' + (relativeModulePath ? relativeModulePath + '/' : '') + parsedModulePath[parsedModulePath.ext === '.js' ? 'name' : 'base'];

  return moduleKey;
};
const getNativeModules = () => {
  return new Promise((resolve) => {
    resolve(
      Object.keys(process.binding('natives')).reduce((nativeModules, nativeDepName) => {
        if (!/^internal\/|_/.test(nativeDepName)) {
          nativeModules[nativeDepName] = require(nativeDepName);
        }

        return nativeModules;
      }, {})
    );
  });
};
const getCustomModules = (containerRoot) => {
  const walker = walk(containerRoot);
  let customModules = {};

  walker.on('file', (dir, fileStat, next) => {
    const parsedModulePath = parse(join(dir, fileStat.name));
    const moduleKey = getModuleKey(containerRoot, dir, parsedModulePath);

    if (/\.(js|json)$/.test(parsedModulePath.ext)) {
      customModules[moduleKey] = require(`${dir}/${parsedModulePath.base}`);
    }
    next();
  });

  return new Promise((resolve) => {
    walker.on('end', resolve.bind(null, customModules));
  });
};
const getNodeModules = () => {
  const packageJsonModuleNames = Object.keys(require('./package.json').dependencies);
  const packageJsonModules = packageJsonModuleNames.reduce((modules, moduleName) => {
    modules[moduleName] = require(moduleName);

    return modules;
  }, {});

  return new Promise((resolve) => {
    resolve(packageJsonModules);
  });
};

module.exports = (options) => {
  const entry = options.entry;
  const containerRoot = options.containerRoot;
  const initialState = options.initialState;

  d('Starting bootstrap');

  return Promise
    .all([
      getNativeModules(),
      getNodeModules(),
      getCustomModules(join(process.cwd(), containerRoot))
    ])
    .then(function(moduleGroups) {
      const nativeModules = moduleGroups[0];
      const nodeModules = moduleGroups[1];
      const customModules = moduleGroups[2];

      Object.assign(deps, nativeModules, nodeModules);
      forOwn(customModules, (module, path) => {
        deps[path] = isFunction(module) ? module(deps) : module;
      });
      deps[entry](initialState);
      d('Bootstrapping done!');
    })
    .catch(e);
};
