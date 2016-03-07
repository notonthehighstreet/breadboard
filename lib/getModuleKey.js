'use strict';

const relative = require('path').relative;

module.exports = (containerRoot, absolutePathToModule, parsedModulePath) => {
  const relativeModulePath = relative(containerRoot, absolutePathToModule);
  const moduleKey = '/' + (relativeModulePath ? relativeModulePath + '/' : '') + parsedModulePath[parsedModulePath.ext === '.js' ? 'name' : 'base'];

  return moduleKey;
};
