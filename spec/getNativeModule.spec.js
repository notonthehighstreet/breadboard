const test = require('ava');
const sinon = require('sinon');
const subject = require('../lib/getNativeModules');
const sandbox = sinon.sandbox.create();
const internalModule = 'internal/fakeNativeModule';
const nonInternalModule = '../spec/fixtures/fakeNativeModule';
const modules = {
  '../spec/fixtures/fakeNativeModule': require('../spec/fixtures/fakeNativeModule'),
  'internal/fakeNativeModule': {}
};
const bindingStub = sandbox.stub(process, 'binding');

bindingStub.returns(modules);
test.afterEach(() => {
  sandbox.reset();
});
test.after(() => {
  sandbox.restore();
});
test.cb('non-internal native modules are returned', t => {
  const fakeNonInternalModule = require('./fixtures/fakeNativeModule');
  const promise = subject([]);

  t.plan(1);
  promise
    .then((nativeModules) => {
      t.same(nativeModules[nonInternalModule], fakeNonInternalModule);
      t.end();
    })
    .catch((err) => {
      t.fail(err);
      t.end();
    });
});
test.cb('when only internal native modules are provided, no modules are returned', t => {
  const promise = subject([]);

  t.plan(1);
  promise
    .then((nativeModules) => {
      t.same(nativeModules[internalModule], undefined);
      t.end();
    })
    .catch((err) => {
      t.fail(err);
      t.end();
    });
});
test.cb('does not add substitutes to deps', t => {
  const substitutes = [nonInternalModule];
  const promise = subject(substitutes);

  t.plan(1);
  promise
    .then((nativeModules) => {
      t.same(nativeModules[nonInternalModule], undefined);
      t.end();
    })
    .catch((err) => {
      t.fail(err);
      t.end();
    });
});
