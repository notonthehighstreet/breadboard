import test from 'ava';
import mock from 'mock-require';
import createChance from 'chance';
import sinon from 'sinon';

const chance = createChance();
const sandbox = sinon.sandbox.create();
const walkerStub = {
  on: sandbox.stub()
};
const walkMock = {
  walk: sandbox.stub().returns(walkerStub)
};
const getModuleKeyMock = sandbox.stub();
const fakeFileStat = {
  name: chance.word()
};
let subject;
let fakeContainerRoot;
let fakeWalkerDir;

test.beforeEach(() => {
  fakeWalkerDir = chance.word();
  walkerStub.on.withArgs('file').yields(fakeWalkerDir, fakeFileStat, () => {
  });
  mock('walk', walkMock);
  mock('../../lib/getModuleKey', getModuleKeyMock);
  fakeContainerRoot = chance.word();
  subject = require('../../lib/getAppModules');
});
test.afterEach(() => {
  mock.stopAll();
  sandbox.reset();
});

test('throws if container root not specified', t => {
  t.throws(subject());
});
test('creates a directory walker', t => {
  subject(fakeContainerRoot);
  t.truthy(walkMock.walk.calledWithExactly(fakeContainerRoot));
});
test('does not throw when no substitutes defined', t => {
  t.notThrows(() => {
    subject(fakeContainerRoot);
  });
});
test('when walker encounters a file it continues the walk', t => {
  const nextSpy = sandbox.spy();

  walkerStub.on.withArgs('file').yields(chance.word(), fakeFileStat, nextSpy);
  subject(fakeContainerRoot);
  t.truthy(nextSpy.calledOnce);
});
test('when walker encounters a file that has a specified substitute', async t => {
  const fakeModuleName = chance.word();

  getModuleKeyMock.returns(fakeModuleName);
  walkerStub.on.withArgs('end').yields();
  t.deepEqual(await subject(fakeContainerRoot, [fakeModuleName]), {});
});
test('when walker encounters a file that has no specified substitute. a module getter is registered', async t => {
  const fakeModuleName = chance.word();
  let customModules;

  getModuleKeyMock.returns(fakeModuleName);
  walkerStub.on.withArgs('end').yields();
  customModules = await subject(fakeContainerRoot);
  t.deepEqual(customModules[fakeModuleName], `${fakeWalkerDir}/${fakeFileStat.name}`);
});
test('when walker encounters errors, promise gets rejected', t => {
  const fakeStatError = {};

  walkerStub.on.withArgs('errors').yields(null, [{
    error: fakeStatError
  }]);

  return subject(fakeContainerRoot)
    .catch(errors => {
      t.deepEqual(errors[0], fakeStatError);
    });
});
