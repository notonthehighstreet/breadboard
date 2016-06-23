import test from 'ava';
import sinon from 'sinon';
import subject from '../../lib/createDepsProxy';
import mock from 'mock-require';
import chanceFactory from 'chance';

const chance = chanceFactory();
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.reset();
});
test('native modules are added to deps', t => {
  const nativeModules = {'fs': require('fs')};
  const moduleGroups = [{}, nativeModules, {}];
  const appDeps = subject(moduleGroups);

  t.is(appDeps['fs'], require('fs'));
});
test('dependency modules are added to deps', t => {
  const nodeModules = {'chance': require('chance')};
  const moduleGroups = [nodeModules, {}, {}];
  const appDeps = subject(moduleGroups);

  t.is(appDeps['chance'], require('chance'));
});
test('app modules as factories are added to deps', t => {
  const fakeAppModuleKey = `/${chance.word()}`;
  const fakeAppModuleFactory = sandbox.stub();
  const fakeAppModule = {};
  const appModules = {[fakeAppModuleKey]: '../spec/fixtures/fakeBreadboardModule'};
  const moduleGroups = [{}, {}, appModules];
  let appDeps;

  fakeAppModuleFactory.returns(fakeAppModule);
  mock('../fixtures/fakeBreadboardModule', fakeAppModuleFactory);
  appDeps = subject(moduleGroups);
  t.is(appDeps[fakeAppModuleKey], fakeAppModule);
});
test('app modules as values are added to deps', t => {
  const fakeAppModuleKey = `/${chance.word()}`;
  const fakeAppModuleValue = {};
  const appModules = {[fakeAppModuleKey]: '../spec/fixtures/fakeBreadboardModule'};
  const moduleGroups = [{}, {}, appModules];
  let appDeps;

  mock('../fixtures/fakeBreadboardModule', fakeAppModuleValue);
  appDeps = subject(moduleGroups);
  t.is(appDeps[fakeAppModuleKey], fakeAppModuleValue);
  mock.stopAll();
});
test('throws if requiring non-existing app module', t => {
  const fakeAppModuleKey = `/${chance.word()}`;
  const moduleGroups = [{}, {}, {}];
  const appDeps = subject(moduleGroups);

  t.throws(() => appDeps[fakeAppModuleKey], `Cannot resolve app module ${fakeAppModuleKey}`);
});
test('deps are frozen', t => {
  const moduleGroups = [{}, {}, {}];
  const deps = subject(moduleGroups);

  t.throws(() => {
    deps.foo = 'update';
  }, 'Runtime changes to dependencies not supported');
});
test('deps are required only when accessed', t => {
  const moduleGroups = [{}, {}, {
    '/entry': '../spec/fixtures/fakeBreadboardEntryModule.js',
    '/fakeBreadboardModule': '../spec/fixtures/fakeBreadboardModule.js'
  }];
  const isFakeBreadboardModule = modulePath => /fakeBreadboardModule\.js$/.test(modulePath);
  const fakeBreadboardModuleKey = Object.keys(require.cache).filter(isFakeBreadboardModule);
  let fakeBreadboardModuleCached;

  delete require.cache[fakeBreadboardModuleKey];
  subject(moduleGroups);
  fakeBreadboardModuleCached = Object.keys(require.cache).some(isFakeBreadboardModule);
  t.false(fakeBreadboardModuleCached);
});
test('accepts explicit substitutes for modules', t => {
  const fakeFs = {};
  const fakeAppModule = {};
  const fakeDepModule = {};
  const moduleGroups = [{'fs': 'fs'}, {'debug': 'debug'}, {'/foo': '../spec/fixtures/fakeBreadboardModule.js'}];
  const deps = subject(moduleGroups, {
    substitutes: {
      'fs': fakeFs,
      'debug': fakeDepModule,
      '/foo': fakeAppModule
    }
  });

  t.is(deps['fs'], fakeFs);
  t.is(deps['debug'], fakeDepModule);
  t.is(deps['/foo'], fakeAppModule);
});
