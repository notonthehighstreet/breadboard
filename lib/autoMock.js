const sinon = require('sinon');

require('harmony-reflect');
module.exports = (breadboardModule, options) => {
  const sandbox = sinon.sandbox.create();
  const mocks = options && options.mocks || {};
  const deps = Object.assign({}, mocks);
  const depsProxy = new Proxy(deps, {
    get(target, name) {
      if (!(name in target)) {
        deps[name] = sandbox.stub();
      }
      return deps[name];
    }
  });

  return {
    subject: breadboardModule(depsProxy),
    deps: depsProxy,
    sandbox: sandbox
  };
};
