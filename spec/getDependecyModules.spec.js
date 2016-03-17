const test = require('ava');
const subject = require('../lib/getDependencyModules');
const packageDir = '../spec/fixtures';
const createOnReject = (t) => {
  return (err) => {
    console.log(err);
    t.end();
    t.fail(err);
  };
};

test.cb('loads modules specified in package.json', t => {
  const promise = subject(packageDir);

  t.plan(1);
  promise
    .then((packageJsonModules) => {
      const expectedModules = {
        '../../../spec/fixtures/fakeModule': require('./fixtures/fakeModule')
      };

      t.same(packageJsonModules, expectedModules);
      t.end();
    })
    .catch(createOnReject(t));
  ;
});
test.cb('does not load modules specified in both package.json and blacklist', t => {
  const blacklist = ['../../../spec/fixtures/fakeModule'];
  const promise = subject(packageDir, blacklist);

  t.plan(1);
  promise
    .then((packageJsonModules) => {
      t.same(packageJsonModules, {});
      t.end();
    })
    .catch(createOnReject(t));
});
test.cb('throws if specified module is not found', t => {
  const brokenPackageDir = '../spec/fixtures/broken';
  const promise = subject(brokenPackageDir);

  t.plan(1);
  promise
    .then((packageJsonModules) => {
      t.throws(() => {
        packageJsonModules['./broken/path/to/module'];
      });
      t.end();
    })
    .catch(createOnReject(t));
});
test.cb('does not load modules specified in both package.json and substitutes', t => {
  const substitutes = ['../../../spec/fixtures/fakeModule'];
  const promise = subject(packageDir, [], substitutes);

  t.plan(1);
  promise
    .then((packageJsonModules) => {
      t.same(packageJsonModules, {});
      t.end();
    })
    .catch(createOnReject(t));
});
