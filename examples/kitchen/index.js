import breadboard from '../../index';

breadboard({
  entry: ({'/kitchen/createKitchen': createKitchen}) => {
    return createKitchen('day');
  },
  containerRoot: 'app'
})
  .then(([deps, entryReturnValue]) => {
    const logger = deps['/logger'];

    logger(entryReturnValue);
  })
  .catch((e) => {
    process.stderr.write(e.stack);
    process.exit(1);
  });
