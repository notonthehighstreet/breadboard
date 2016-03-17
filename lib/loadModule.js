const parse = require('path').parse;
const join = require('path').join;
const getModuleKey = require('./getModuleKey');
const debug = require('debug');
const d = debug('breadboard:loadAppModule');

module.exports = (moduleDirectory, fileStat) => {
  const parsedModulePath = parse(join(moduleDirectory, fileStat.name));

  if (/\.(js|json)$/.test(parsedModulePath.ext)) {
    return () => {
      d(`Requiring ${moduleDirectory}/${parsedModulePath.base}`);

      return require(`${moduleDirectory}/${parsedModulePath.base}`);
    };
  }
  else {
    throw new Error(`Invalid dependency type '${parsedModulePath.ext}' for module: '${parsedModulePath.name}'`);
  }
};
