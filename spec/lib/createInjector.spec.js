import test from 'ava';
import sinon from 'sinon';
import builder from '../../lib/createInjector';
import Chance from 'chance';

const sandbox = sinon.sandbox.create();
const chance = Chance();
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
test('throws if no entry point specified', t => {
  t.throws(() => {
    builder({initialState});
  });
});
test('entry is a function, function is executed with initial state', async t => {
  const subject = builder({entry, initialState});
  const moduleGroups = [{}, {}, {}];
  const [applicationEntryResolveValue] = await subject(moduleGroups);

  t.is(applicationEntryResolveValue, resolved);
});
test('entry is a module, module is executed with initial state', async t => {
  const subject = builder({entry: '/entry', initialState});
  const moduleGroups = [{}, {}, {'/entry': '../spec/fixtures/fakeBreadboardModule.js'}];
  const [applicationEntryResolveValue] = await subject(moduleGroups);

  t.is(applicationEntryResolveValue, initialState);
});
test('module is a function, function is executed and result is added to deps', async t => {
  const subject = builder({entry: '/entry', initialState});
  const moduleGroups = [{}, {}, {'/entry': '../spec/fixtures/fakeBreadboardModule'}];
  const [, appDeps] = await subject(moduleGroups);
  const randomArguments = chance.n(chance.word, chance.natural({min: 1, max: 20}));

  t.is(appDeps['/entry'].apply(null, randomArguments), require('../fixtures/fakeBreadboardModule')(appDeps).apply(null, randomArguments));
});
test('module is not a function, module is added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const customModules = {'/fakeBreadboardJsonFile.json': '../spec/fixtures/fakeBreadboardJsonFile.json'};
  const moduleGroups = [{}, {}, customModules];
  const [, appDeps] = await subject(moduleGroups);

  t.deepEqual(appDeps['/fakeBreadboardJsonFile.json'], require('../fixtures/fakeBreadboardJsonFile.json'));
});
test('native modules are added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const nativeModules = {'fs': require('fs')};
  const moduleGroups = [{}, nativeModules, {}];
  const [, appDeps] = await subject(moduleGroups);

  t.is(appDeps['fs'], require('fs'));
});
test('dependency modules are added to deps', async t => {
  const subject = builder({entry: entry, initialState: initialState});
  const nodeModules = {'chance': require('chance')};
  const moduleGroups = [nodeModules, {}, {}];
  const [, appDeps] = await subject(moduleGroups);

  t.is(appDeps['chance'], require('chance'));
});
test('deps are frozen', t => {
  const subject = builder({entry: entry, initialState: initialState});
  const moduleGroups = [{}, {}, {}];

  t.plan(1);
  return subject(moduleGroups)
    .then((createInjectorResolved) => {
      const updateDeps = () => {
        createInjectorResolved[1].foo = 'update';
      };

      t.throws(updateDeps, TypeError);
    });
});
test('deps are required only when accessed', async t => {
  const subject = builder({entry: '/entry', initialState});
  const moduleGroups = [{}, {}, {
    '/entry': '../spec/fixtures/fakeBreadboardEntryModule.js',
    '/fakeBreadboardModule': '../spec/fixtures/fakeBreadboardModule.js'
  }];
  const isFakeBreadboardModule = modulePath => /fakeBreadboardModule\.js$/.test(modulePath);
  const fakeBreadboardModuleKey = Object.keys(require.cache).filter(isFakeBreadboardModule);
  let fakeBreadboardModuleCached;

  delete require.cache[fakeBreadboardModuleKey];
  await subject(moduleGroups);
  fakeBreadboardModuleCached = Object.keys(require.cache).some(isFakeBreadboardModule);
  t.false(fakeBreadboardModuleCached);
});
