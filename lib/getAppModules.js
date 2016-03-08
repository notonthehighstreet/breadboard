'use strict';

const debug = require('debug');
const walk = require('walk').walk;
const loadModule = require('./loadModule');
const d = debug('breadboard:setup');

module.exports = (containerRoot) => {
  const walker = walk(containerRoot);
  let customModules = {};

  walker.on('file', (dir, fileStat, next) => {
    const module = loadModule(containerRoot, dir, fileStat);
    Object.assign(customModules, module);
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
