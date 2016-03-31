const test = require('ava');
const subject = require('../lib/getDependencyModules');
const packageDir = '../spec/fixtures';
const chance = new require('chance')();

test('loads modules specified in package.json', async t => {
  const expectedModules = {
    '../../../spec/fixtures/fakeModule': require('./fixtures/fakeModule')
  };

  t.same(await subject(packageDir), expectedModules);
});
test('does not load modules specified in both package.json and blacklist', async t => {
  const blacklist = ['../../../spec/fixtures/fakeModule'];

  t.same(await subject(packageDir, blacklist), {});
});
test('throws if specified module is not found', async t => {
  const brokenPackageDir = '../spec/fixtures/broken';
  const packageJsonModules = await subject(brokenPackageDir);

  t.throws(() => {
    packageJsonModules['./broken/path/to/module'];
  });
});
test('throws if package.json doesn\'t exist', t => {
  const nonExistentPackageDir = `../spec/fixtures/${chance.word()}`;

  return subject(nonExistentPackageDir)
    .catch((e) => {
      t.ok(e instanceof Error);
    });
});
test('throws if package.json doesn\'t include dependencies', t => {
  const packageWithoutDepsDir = '../spec/fixtures/packageJsonWithoutDependencies';

  return subject(packageWithoutDepsDir)
    .catch((e) => {
      t.ok(e instanceof Error);
    });
});
test('does not load modules specified in both package.json and substitutes', async t => {
  const substitutes = ['../../../spec/fixtures/fakeModule'];

  t.same(await subject(packageDir, [], substitutes), {});
});
