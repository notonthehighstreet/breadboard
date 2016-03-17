'use strict';

const debug = require('debug');
const d = debug('breadboard:setup');

module.exports = (substitutes) => {
  const natives = Object.keys(process.binding('natives'));

  return new Promise((resolve) => {
    const nativeModules = natives.reduce((nms, nativeModuleName) => {
      if (substitutes.some(substituteName => substituteName === nativeModuleName)) {
        return nms;
      }
      if (!/^internal\/|_/.test(nativeModuleName)) {
        Object.defineProperty(nms, nativeModuleName, {
          enumerable: true,
          get: () => {
            d(`Requiring ${nativeModuleName}`);

            return require(nativeModuleName);
          }
        });
      }

      return nms;
    }, {});
    d('Native modules', Object.keys(nativeModules));

    return resolve(nativeModules);
  });
};
