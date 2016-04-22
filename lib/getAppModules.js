'use strict';

const debug = require('debug');
const walk = require('walk').walk;
const parse = require('path').parse;
const join = require('path').join;
const relative = require('path').relative;
const getModuleKey = require('./getModuleKey');
const d = debug('breadboard:setup:appModules');

module.exports = (containerRoot, substitutes) => {
  if (!containerRoot) {
    return Promise.reject(new Error('Expected container root to be specified'));
  }
  const walker = walk(containerRoot);
  let appModules = {};

  substitutes = substitutes || [];
  walker.on('file', (dir, fileStat, next) => {
    const parsedModulePath = parse(join(dir, fileStat.name));
    const relativePath = relative(containerRoot, dir);
    const moduleKey = getModuleKey(relativePath.replace(/\\/g, '/'), parsedModulePath);

    if (substitutes.every(substitute => substitute !== moduleKey)) {
      appModules[moduleKey] = join(dir, fileStat.name);
    }
    next();
  });

  return new Promise((resolve, reject) => {
    walker.on('errors', (root, stats) => {
      reject(stats.map(stat => stat.error));
    });
    walker.on('end', () => {
      d('App modules', Object.keys(appModules));
      resolve(appModules);
    });
  });
};
