'use strict';

const debug = require('debug');
const walk = require('walk').walk;
const parse = require('path').parse;
const join = require('path').join;
const relative = require('path').relative;
const loadModule = require('./loadModule');
const getModuleKey = require('./getModuleKey');
const d = debug('breadboard:setup');

module.exports = (containerRoot, substitutes) => {
  const walker = walk(containerRoot);
  let customModules = {};

  walker.on('file', (dir, fileStat, next) => {
    const parsedModulePath = parse(join(dir, fileStat.name));
    const relativePath = relative(containerRoot, dir);
    const moduleKey = getModuleKey(relativePath, parsedModulePath);

    if (substitutes.every(substitute => substitute !== moduleKey)) {
      Object.defineProperty(customModules, moduleKey, {
        get: loadModule(dir, fileStat),
        enumerable: true
      });
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
