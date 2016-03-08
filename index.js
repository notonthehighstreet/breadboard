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

  d('Starting bootstrap');

  return Promise
    .all([
      getNativeModules(),
      getDependencyModules(process.cwd(), blacklist),
      getAppModules(join(process.cwd(), containerRoot))
    ])
    .then(createInjector({
      entry: options.entry,
      initialState: options.initialState
    }))
    .catch(e);
};
