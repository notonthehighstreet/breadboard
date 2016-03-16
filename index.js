'use strict';

const debug = require('debug');
const join = require('path').join;
const getNativeModules = require('./lib/getNativeModules');
const getAppModules = require('./lib/getAppModules');
const getDependencyModules = require('./lib/getDependencyModules');
const createInjector = require('./lib/createInjector');
const d = debug('breadboard:setup');
const e = debug('breadboard:error');

module.exports = (options) => {
  const containerRoot = options.containerRoot;
  const blacklist = options.blacklist || [];
  const substitutes = options.substitutes || {};
  const substituteKeys = Object.keys(substitutes);

  d('Starting bootstrap');

  return Promise
    .all([
      getNativeModules(substituteKeys),
      getDependencyModules(process.cwd(), blacklist, substituteKeys),
      getAppModules(join(process.cwd(), containerRoot), substituteKeys)
    ])
    .then(createInjector({
      entry: options.entry,
      initialState: options.initialState,
      substitutes: options.substitutes
    }))
    .catch((err) => {
      e(err);

      return Promise.reject(err);
    });
};
