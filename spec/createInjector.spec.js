const test = require('ava');
const sinon = require('sinon');
const builder = require('../lib/createInjector');
const sandbox = sinon.sandbox.create();
const initialState = {foo: 'bar'};
const resolved = {};
const applicationEntryPromise = Promise.resolve(resolved);
const entryStub = sandbox.stub();
const entry = () => {
  return entryStub;
};

entryStub.returns(applicationEntryPromise);
test.afterEach(() => {
  sandbox.reset();
});
test('entry is a function, function is executed with initial state', async t => {
  const subject = builder({entry, initialState});
  const moduleGroups = [{}, {}, {}];
  const [applicationEntryResolveValue] = await subject(moduleGroups);

  t.is(applicationEntryResolveValue, resolved);
});
test('entry is a module, module is executed with initial state', async t => {
  const subject = builder({entry: '/entry', initialState});
  const moduleGroups = [{}, {}, {'/entry': entry}];
  const [applicationEntryResolveValue] = await subject(moduleGroups);

  t.is(applicationEntryResolveValue, resolved);
});
test('module is a function, function is executed and result is added to deps', async t => {
  const subject = builder({entry: '/entry', initialState});
  const moduleGroups = [{}, {}, {'/entry': entry}];
  const [, appDeps] = await subject(moduleGroups);

  t.is(appDeps['/entry'], entryStub);
});
test('module is not a function, module is added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const customModules = {'/fakeModule': {}};
  const moduleGroups = [{}, {}, customModules];
  const [, appDeps] = await subject(moduleGroups);

  t.same(appDeps, customModules);
});
test('native modules are added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const nativeModules = {'fakeNativeModule': {}};
  const moduleGroups = [{}, nativeModules, {}];
  const [, appDeps] = await subject(moduleGroups);

  t.same(appDeps, nativeModules);
});
test('node modules are added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const nodeModules = {'fakeNodeModule': {}};
  const moduleGroups = [nodeModules, {}, {}];
  const [, appDeps] = await subject(moduleGroups);

  t.same(appDeps, nodeModules);
});
test('deps are frozen', t => {
  const subject = builder({entry: entry, initialState: initialState});
  const moduleGroups = [{}, {}, {}];

  return subject(moduleGroups)
    .then((createInjectorResolved) => {
      const updateDeps = () => {
        createInjectorResolved[1].foo = 'update';
      };

      t.throws(updateDeps, TypeError);
    });
});
