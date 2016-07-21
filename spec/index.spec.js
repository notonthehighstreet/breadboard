import test from 'ava';
import sinon from 'sinon';
import mock from 'mock-require';
import Chance from 'chance';

const chance = Chance();
const sandbox = sinon.sandbox.create();
const getNativeModulesMock = sandbox.stub();
const getDependencyModulesMock = sandbox.stub();
const getAppModulesMock = sandbox.stub();
const createDepsProxyMock = sandbox.stub();
const fakeEntryModule = sandbox.stub();
let fakeContainerRoot;
let fakeEntryModuleKey;
let fakeDeps;
let subject;

test.after(() => {
  sandbox.restore();
});
test.beforeEach(() => {
  fakeEntryModuleKey = chance.word();
  fakeContainerRoot = chance.word();
  fakeDeps = {
    [fakeEntryModuleKey]: fakeEntryModule
  };
  getNativeModulesMock.returns(Promise.resolve());
  getDependencyModulesMock.returns(Promise.resolve());
  getAppModulesMock.returns(Promise.resolve());
  createDepsProxyMock.returns(fakeDeps);
  mock('../lib/getNativeModules', getNativeModulesMock);
  mock('../lib/getDependencyModules', getDependencyModulesMock);
  mock('../lib/getAppModules', getAppModulesMock);
  mock('../lib/createDepsProxy', createDepsProxyMock);
  subject = require('../index');
});
test.afterEach(() => {
  mock.stopAll();
  sandbox.reset();
});
test('throws if no entry point given', t => {
  t.throws(() => subject({
    containerRoot: fakeContainerRoot
  }), 'Expected application entry point to be specified');
});
test('bootstraps container with entry as custom function', async t => {
  const customEntryFunction = sandbox.stub();
  const fakeCustomEntryFunctionReturnValue = chance.word();

  customEntryFunction.returns(fakeCustomEntryFunctionReturnValue);
  t.deepEqual(
    await subject({
      containerRoot: fakeContainerRoot,
      entry: customEntryFunction
    }),
    {deps: fakeDeps, entryResolveValue: fakeCustomEntryFunctionReturnValue},
    'expected bootstrapping to resolve with array of dependencies and return value of entry point'
  );
  t.is(
    customEntryFunction.args[0][0],
    fakeDeps,
    'expected to call custom entry function with app dependencies'
  );
});
test('bootstraps container with entry as module key', async t => {
  const fakeAppReturnValue = chance.word();
  const fakeInitialState = {};

  fakeEntryModule.returns(fakeAppReturnValue);
  t.deepEqual(
    await subject({
      containerRoot: fakeContainerRoot,
      entry: fakeEntryModuleKey,
      initialState: fakeInitialState
    }),
    {deps: fakeDeps, entryResolveValue: fakeAppReturnValue},
    'expected bootstrapping to resolve with array of dependencies and return value of entry point'
  );
  t.is(fakeEntryModule.args[0][0], fakeInitialState, 'expected to call entry module with passed in initial state');
});
test('rejects promise on entry module errors', t => {
  const fakeErrorMessage = chance.word();
  const fakeError = new Error(fakeErrorMessage);

  fakeEntryModule.throws(fakeError);
  t.throws(subject({
    containerRoot: fakeContainerRoot,
    entry: fakeEntryModuleKey
  }), fakeErrorMessage);
});
test('resolves with entry point returned promise resolve value', async t => {
  const fakeEntryModuleResolveValue = {};
  let resolveValue;

  fakeEntryModule.returns(Promise.resolve(fakeEntryModuleResolveValue));
  resolveValue = await subject({
    containerRoot: fakeContainerRoot,
    entry: fakeEntryModuleKey
  });

  t.is(resolveValue.entryResolveValue, fakeEntryModuleResolveValue);
});
test.cb('rejects with entry point returned promise reject value', t => {
  const fakeEntryModuleRejectValue = chance.word();

  fakeEntryModule.returns(Promise.reject(fakeEntryModuleRejectValue));
  subject({
    containerRoot: fakeContainerRoot,
    entry: fakeEntryModuleKey
  })
    .catch((e) => {
      t.is(e, fakeEntryModuleRejectValue);
      t.end();
    });
});
