const test = require('ava');
const subject = require('../lib/getNativeModules');

test.cb('when only non-internal native modules are provided, all modules are returned', t => {
  const moduleKey = '../spec/fixtures/fakeNativeModule';
  const natives = [moduleKey];
  const expectedNativeModule = require('./fixtures/fakeNativeModule');
  const promise = subject(natives);

  t.plan(1);
  promise.then((nativeModules) => {
    t.same(nativeModules[moduleKey], expectedNativeModule);
    t.end();
  });
});
test.cb('when only internal native modules are provided, no modules are returned', t => {
  const moduleKey = 'internal/fakeNativeModule';
  const natives = [moduleKey];
  const promise = subject(natives);

  t.plan(1);
  promise.then((nativeModules) => {
    t.same(nativeModules[moduleKey], undefined);
    t.end();
  }).catch((err) => {
    t.fail(err);
    t.end();
  });
});
test.cb('when both internal and non-internal native modules are provided, only non-internal modules are returned', t => {
  const internalModuleKey = 'internal/fakeNativeModule';
  const nonInternalModuleKey = '../spec/fixtures/fakeNativeModule';
  const natives = [internalModuleKey, nonInternalModuleKey];
  const expectedNativeModule = require('./fixtures/fakeNativeModule');
  const promise = subject(natives);

  t.plan(2);
  promise.then((nativeModules) => {
    t.same(nativeModules[internalModuleKey], undefined);
    t.same(nativeModules[nonInternalModuleKey], expectedNativeModule);
    t.end();
  }).catch((err) => {
    t.fail(err);
    t.end();
  });
});
