const relative = require('path').relative;
const parse = require('path').parse;
const join = require('path').join;
const getModuleKey = require('./getModuleKey');
const debug = require('debug');
const d = debug('breadboard:loadAppModule');

module.exports = (containerRoot, moduleDirectory, fileStat) => {
  const parsedModulePath = parse(join(moduleDirectory, fileStat.name));
  const relativePath = relative(containerRoot, moduleDirectory);
  const moduleKey = getModuleKey(relativePath, parsedModulePath);

  if (/\.(js|json)$/.test(parsedModulePath.ext)) {
    return Object.create({}, {
      [moduleKey]: {
        get: () => {
          d(`Requiring ${moduleDirectory}/${parsedModulePath.base}`);

          return require(`${moduleDirectory}/${parsedModulePath.base}`);
        },
        enumerable: true
      }
    });
  }
  else {
    throw new Error(`Invalid dependency type '${parsedModulePath.ext}' for module: '${parsedModulePath.name}'`);
  }
};
