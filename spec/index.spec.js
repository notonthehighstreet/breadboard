import test from 'ava';
import sinon from 'sinon';
import mock from 'mock-require';
import Chance from 'chance';

const chance = Chance();
const sandbox = sinon.sandbox.create();
const getNativeModulesMock = sandbox.stub();
const getDependencyModulesMock = sandbox.stub();
const getAppModulesMock = sandbox.stub();
const createInjectorMock = sandbox.stub();
let subject;

test.after(() => {
  sandbox.restore();
});
test.beforeEach(() => {
  getNativeModulesMock.returns(Promise.resolve());
  getDependencyModulesMock.returns(Promise.resolve());
  getAppModulesMock.returns(Promise.resolve());
  mock('../lib/getNativeModules', getNativeModulesMock);
  mock('../lib/getDependencyModules', getDependencyModulesMock);
  mock('../lib/getAppModules', getAppModulesMock);
  mock('../lib/createInjector', createInjectorMock);
  subject = require('../index');
});
test.afterEach(() => {
  mock.stopAll();
  sandbox.reset();
});
test('creates an injector when dependencies are loaded', async t => {
  const fakeInjectorResolveValue = {};

  createInjectorMock.returns(() => Promise.resolve(fakeInjectorResolveValue));
  t.is(
    await subject({
      containerRoot: chance.word(),
      entry: chance.word()
    }),
    fakeInjectorResolveValue
  );
});
test('reject promise on errors', t => {
  const fakeError = {};

  t.plan(1);
  createInjectorMock.returns(() => {
    return Promise.reject(fakeError);
  });

  return subject({
    containerRoot: chance.word(),
    entry: chance.word()
  })
    .catch((e) => {
      t.is(e, fakeError);
    });
});
