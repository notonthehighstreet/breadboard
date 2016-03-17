const test = require('ava');
const subject = require('../lib/loadModule');
const moduleDirectory = '../spec/fixtures';

test('creates a getter for a CommonJS module', t => {
  const fileStat = {
    name: 'fakeModule.js'
  };
  const expectedModule = require('./fixtures/fakeModule');
  const module = subject(moduleDirectory, fileStat)();
  t.same(module, expectedModule);
});
test('creates a getter for a JSON file', t => {
  const fileStat = {
    name: 'fakeConfig.json'
  };
  const expectedModule = require('./fixtures/fakeConfig.json');
  const module = subject(moduleDirectory, fileStat)();
  t.same(module, expectedModule);
});
test('loading a non JS/JSON file it throws an error', t => {
  const fileStat = {
    name: 'animation.swf'
  };
  t.throws(() => {
    subject(moduleDirectory, fileStat)();
  });
});
