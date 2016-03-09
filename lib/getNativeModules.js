'use strict';

const debug = require('debug');
const d = debug('breadboard:setup');

module.exports = (natives) => {
  natives = natives ||  /* istanbul ignore next */ Object.keys(process.binding('natives'));

  return new Promise((resolve) => {
    const nativeModules = natives.reduce((nms, nativeModuleName) => {
      if (!/^internal\/|_/.test(nativeModuleName)) {
        nms[nativeModuleName] = require(nativeModuleName);
      }

      return nms;
    }, {});
    d('Native modules', Object.keys(nativeModules));

    return resolve(nativeModules);
  });
};
