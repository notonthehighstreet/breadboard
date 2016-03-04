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
    const nativeModules = Object.keys(process.binding('natives')).reduce((nms, nativeModuleName) => {
      if (!/^internal\/|_/.test(nativeModuleName)) {
        nms[nativeModuleName] = require(nativeModuleName);
      }

      return nms;
    }, {});
    d('Native modules', Object.keys(nativeModules));

    return resolve(nativeModules);
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

  return new Promise((resolve, reject) => {
    walker.on('errors', (root, stats) => {
      reject(stats.map(stat => stat.error));
    });
    walker.on('end', () => {
      d('Custom modules', Object.keys(customModules));
      resolve(customModules);
    });
  });
};
const getNodeModules = (packageDir) => {
  return new Promise((resolve) => {
    const packageJsonModuleNames = Object.keys(require(`${packageDir}/package.json`).dependencies);
    const packageJsonModules = packageJsonModuleNames.reduce((modules, moduleName) => {
      modules[moduleName] = require.main.require(moduleName);

      return modules;
    }, {});
    d('package.json modules', Object.keys(packageJsonModules));

    return resolve(packageJsonModules);
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
      getNodeModules(process.cwd()),
      getCustomModules(join(process.cwd(), containerRoot))
    ])
    .then(function(moduleGroups) {
      const nativeModules = moduleGroups[0];
      const nodeModules = moduleGroups[1];
      const customModules = moduleGroups[2];
      let applicationEntry = deps[entry];

      Object.assign(deps, nativeModules, nodeModules);
      forOwn(customModules, (module, path) => {
        deps[path] = isFunction(module) ? module(deps) : module;
      });
      Object.freeze(deps);
      if (typeof entry === 'function') {
        applicationEntry = entry(deps);
      }

      return Promise.all([
        applicationEntry(initialState),
        deps
      ]);
    })
    .catch(e);
};
