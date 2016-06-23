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
  const fakeCustomEntryFunctionReturnValue = {};

  customEntryFunction.returns(fakeCustomEntryFunctionReturnValue);
  t.is(
    await subject({
      containerRoot: fakeContainerRoot,
      entry: customEntryFunction
    }),
    fakeCustomEntryFunctionReturnValue
  );
  t.is(
    customEntryFunction.args[0][0],
    fakeDeps
  );
});
test('bootstraps container with entry as module key', async t => {
  const fakeAppReturnValue = {};

  fakeEntryModule.returns(fakeAppReturnValue);
  t.is(
    await subject({
      containerRoot: fakeContainerRoot,
      entry: fakeEntryModuleKey
    }),
    fakeAppReturnValue
  );
});
test('rejects promise on errors', t => {
  const fakeErrorMessage = chance.word();
  const fakeError = new Error(fakeErrorMessage);

  fakeEntryModule.throws(fakeError);
  t.throws(subject({
    containerRoot: fakeContainerRoot,
    entry: fakeEntryModuleKey
  }), fakeErrorMessage);
});
