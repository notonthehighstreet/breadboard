'use strict';

const debug = require('debug');
const d = debug('breadboard:setup');

module.exports = () => {
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
