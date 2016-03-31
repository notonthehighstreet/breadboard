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
test('non-internal native modules are returned', async t => {
  const fakeNonInternalModule = require('./fixtures/fakeNativeModule');
  const nativeModules = await subject([]);

  t.same(nativeModules[nonInternalModule], fakeNonInternalModule);
});
test('when only internal native modules are provided, no modules are returned', async t => {
  const nativeModules = await subject([]);

  t.same(nativeModules[internalModule], undefined);
});
test('does not add substitutes to deps', async t => {
  const substitutes = [nonInternalModule];
  const nativeModules = await subject(substitutes);

  t.same(nativeModules[nonInternalModule], undefined);
});
