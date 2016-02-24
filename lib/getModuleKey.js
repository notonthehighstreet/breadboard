'use strict';

const getModuleFilename = (parsedFileName) => {
  return parsedFileName[parsedFileName.ext === '.js' ? 'name' : 'base'];
};

const buildModulePath = (relativeModulePath) => {
  return '/' + (relativeModulePath ? relativeModulePath + '/' : '');
};

module.exports = (relativeModulePath, parsedModulePath) => {
  return buildModulePath(relativeModulePath) + getModuleFilename(parsedModulePath);
};
