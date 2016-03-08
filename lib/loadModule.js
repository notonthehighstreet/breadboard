const relative = require('path').relative;
const parse = require('path').parse;
const join = require('path').join;
const getModuleKey = require('./getModuleKey');

module.exports = (containerRoot, moduleDirectory, fileStat) => {
  const parsedModulePath = parse(join(moduleDirectory, fileStat.name));
  const relativePath = relative(containerRoot, moduleDirectory);
  const moduleKey = getModuleKey(relativePath, parsedModulePath);

  if (/\.(js|json)$/.test(parsedModulePath.ext)) {
    return {
      [moduleKey]: require(`${moduleDirectory}/${parsedModulePath.base}`)
    };
  }
  else {
    throw new Error(`Invalid dependency type '${parsedModulePath.ext}' for module: '${parsedModulePath.name}'`);
  }
};
