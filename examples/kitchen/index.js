import breadboard from '../../index';

breadboard({
  entry: ({'/kitchen/createKitchen': createKitchen}) => {
    return createKitchen('day');
  },
  containerRoot: 'app'
})
  .then(({deps, entryResolveValue}) => {
    const logger = deps['/logger'];

    logger(entryResolveValue);
  })
  .catch((e) => {
    process.stderr.write(e.stack);
    process.exit(1);
  });
