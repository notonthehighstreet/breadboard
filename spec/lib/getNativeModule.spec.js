import test from 'ava';
import sinon from 'sinon';
import subject from '../../lib/getNativeModules';

const sandbox = sinon.sandbox.create();
const fakeInternalModuleKey = 'internal/fakeNativeModule';
const fakeNativeModuleKey = 'fakeNativeModule';
const modules = {
  [fakeNativeModuleKey]: {},
  [fakeInternalModuleKey]: {}
};

test.before(() => {
  sandbox.stub(process, 'binding').withArgs('natives').returns(modules);
});
test.after(() => {
  sandbox.restore();
});
test.afterEach(() => {
  sandbox.reset();
});
test('non-internal native modules are returned', async t => {
  const nativeModules = await subject([]);

  t.is(nativeModules[fakeNativeModuleKey], fakeNativeModuleKey);
});
test('when only internal native modules are provided, no modules are returned', async t => {
  const nativeModules = await subject([]);

  t.is(nativeModules[fakeInternalModuleKey], undefined);
});
test('does not add substitutes to deps', async t => {
  const substitutes = [fakeNativeModuleKey];
  const nativeModules = await subject(substitutes);

  t.is(nativeModules[fakeNativeModuleKey], undefined);
});
