const test = require('ava');
const subject = require('../lib/loadModule');
const containerRoot = 'fixtures';
const moduleDirectory = '../spec/fixtures';

test('loads a javascript module and assigns a key to it', t => {
  const fileStat = {
    name: 'fakeModule.js'
  };
  const expectedModule = {
    '/fakeModule': require('./fixtures/fakeModule')
  };
  const module = subject(containerRoot, moduleDirectory, fileStat);
  t.same(module, expectedModule);
});
test('loads a JSON module and assigns a key to it', t => {
  const fileStat = {
    name: 'fakeConfig.json'
  };
  const expectedModule = {
    '/fakeConfig.json': require('./fixtures/fakeConfig.json')
  };
  const module = subject(containerRoot, moduleDirectory, fileStat);
  t.same(module, expectedModule);
});
test('loading a non JS/JSON file it throws an error', t => {
  const fileStat = {
    name: 'animation.swf'
  };
  t.throws(subject.bind(null, containerRoot, moduleDirectory, fileStat));
});
