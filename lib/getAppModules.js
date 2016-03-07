'use strict';

const debug = require('debug');
const getModuleKey = require('./getModuleKey');
const walk = require('walk').walk;
const parse = require('path').parse;
const join = require('path').join;
const d = debug('breadboard:setup');

module.exports = (containerRoot) => {
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
