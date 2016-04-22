const test = require('ava');
const subject = require('../../lib/getDependencyModules');
const packageDir = '../../spec/fixtures';
const chance = new require('chance')();

test('registers modules specified in package.json', async t => {
  t.deepEqual(await subject(packageDir), {
    'fakeDependency': 'fakeDependency'
  });
});
test('does not load modules specified in both package.json and blacklist', async t => {
  const blacklist = ['fakeDependency'];

  t.deepEqual(await subject(packageDir, blacklist), {});
});
test('throws if specified module is not found', t => {
  const brokenPackageDir = `../../spec/fixtures/${chance.word()}`;

  t.throws(subject(brokenPackageDir));
});
test('throws if package.json doesn\'t exist', t => {
  const nonExistentPackageDir = `../spec/fixtures/${chance.word()}`;

  return subject(nonExistentPackageDir)
    .catch((e) => {
      t.truthy(e instanceof Error);
    });
});
test('throws if package.json doesn\'t include dependencies', t => {
  const packageWithoutDepsDir = '../spec/fixtures/packageJsonWithoutDependencies';

  return subject(packageWithoutDepsDir)
    .catch((e) => {
      t.truthy(e instanceof Error);
    });
});
test('does not load modules specified in both package.json and substitutes', async t => {
  const substitutes = ['fakeDependency'];

  t.deepEqual(await subject(packageDir, [], substitutes), {});
});
