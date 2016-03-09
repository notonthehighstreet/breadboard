const test = require('ava');
const sinon = require('sinon');
const builder = require('../lib/createInjector');

const sandbox = sinon.sandbox.create();
const initialState = { foo: 'bar' };
const resolved = 'application entry resolved';
const applicationEntryPromise = new Promise((resolve) => {
  resolve(resolved);
});
const entryStub = sandbox.stub();
const entry = () => {
  return entryStub;
};

entryStub.returns(applicationEntryPromise);
test.afterEach(() => {
  sandbox.reset();
});
test.cb('entry is a function, function is executed with initial state', t => {
  const subject = builder({ entry, initialState });
  const moduleGroups = [{}, {}, {}];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    t.same(createInjectorResolved[0], resolved);
    t.end();
  });
});
test.cb('entry is a module, module is executed with initial state', t => {
  const subject = builder({ entry: '/entry', initialState });
  const moduleGroups = [{}, {}, { '/entry': entry }];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    t.same(createInjectorResolved[0], resolved);
    t.end();
  });
});
test.cb('module is a function, function is executed and result is added to deps', t => {
  const subject = builder({ entry: '/entry', initialState });
  const moduleGroups = [{}, {}, { '/entry': entry }];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    t.is(createInjectorResolved[1]['/entry'], entryStub);
    t.end();
  });
});
test.cb('module is not a function, module is added to deps', t => {
  const subject = builder({ entry: entry, initialState: initialState });
  const customModules = { '/fakeModule': {} };
  const moduleGroups = [{}, {}, customModules];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    t.same(createInjectorResolved[1], customModules);
    t.end();
  });
});
test.cb('native modules are added to deps', t => {
  const subject = builder({ entry: entry, initialState: initialState });
  const nativeModules = { 'fakeNativeModule': {} };
  const moduleGroups = [{}, nativeModules, {}];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then(([, deps]) => {
    t.same(deps, nativeModules);
    t.end();
  });
});
test.cb('node modules are added to deps', t => {
  const subject = builder({ entry: entry, initialState: initialState });
  const nodeModules = { 'fakeNodeModule': {} };
  const moduleGroups = [nodeModules, {}, {}];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    t.same(createInjectorResolved[1], nodeModules);
    t.end();
  });
});
test.cb('deps are frozen', t => {
  const subject = builder({ entry: entry, initialState: initialState });
  const moduleGroups = [{}, {}, {}];
  const promise = subject(moduleGroups);

  t.plan(1);
  promise.then((createInjectorResolved) => {
    const updateDeps = () => {
      createInjectorResolved[1].foo = 'update';
    };

    t.throws(updateDeps, TypeError);
    t.end();
  });
});
