'use strict';

const debug = require('debug');
const join = require('path').join;
const getNativeModules = require('./lib/getNativeModules');
const getAppModules = require('./lib/getAppModules');
const getDependencyModules = require('./lib/getDependencyModules');
const createDepsProxy = require('./lib/createDepsProxy');
const isFunction = require('lodash/isFunction');
const d = debug('breadboard:setup');
const e = debug('breadboard:error');

module.exports = (options) => {
  const containerRoot = options.containerRoot;
  const blacklist = options.blacklist || [];
  const substitutes = options.substitutes || {};
  const substituteKeys = Object.keys(substitutes);
  const entry = options.entry;
  const initialState = options.initialState;

  if (!entry) {
    throw new Error('Expected application entry point to be specified');
  }
  d('Starting bootstrap');

  return Promise
    .all([
      getNativeModules(substituteKeys),
      getDependencyModules(process.cwd(), blacklist, substituteKeys),
      getAppModules(join(process.cwd(), containerRoot), substituteKeys)
    ])
    .then((moduleGroups) => {
      const depsProxy = createDepsProxy(moduleGroups, {
        substitutes: substitutes
      });
      let entryPointReturn;

      if (isFunction(entry)) {
        entryPointReturn = entry(depsProxy);
      }
      else {
        entryPointReturn = depsProxy[entry](initialState);
      }

      return Promise
        .resolve(entryPointReturn)
        .then((entryPointResolveValue) => {
          return {
            deps: depsProxy,
            entryResolveValue: entryPointResolveValue
          };
        });
    })
    .catch((err) => {
      e(err);

      return Promise.reject(err);
    });
};
