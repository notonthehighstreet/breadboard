const test = require('ava');
const subject = require('../lib/getModuleKey');

test('module is a JavaScript file, it does not include the file extension', t => {
  const relativeModulePath = 'containerRoot/lib/modules';
  const parsedModulePath = {
    base: 'file.js',
    name: 'file',
    ext: '.js'
  };
  const moduleKey = subject(relativeModulePath, parsedModulePath);
  t.is(moduleKey, '/containerRoot/lib/modules/file');
});
test('module is not a JavaScript file, it includes the file extension', t => {
  const relativeModulePath = 'containerRoot/lib/modules';
  const parsedModulePath = {
    base: 'file.json',
    name: 'file',
    ext: '.json'
  };
  const moduleKey = subject(relativeModulePath, parsedModulePath);
  t.is(moduleKey, '/containerRoot/lib/modules/file.json');
});
test('relative path is empty, return filename', t => {
  const relativeModulePath = '';
  const parsedModulePath = {
    base: 'file.js',
    name: 'file',
    ext: '.js'
  };
  const moduleKey = subject(relativeModulePath, parsedModulePath);
  t.is(moduleKey, '/file');
});
