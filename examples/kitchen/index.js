import breadboard from '../../index';

breadboard({
  entry: ({'/kitchen/createKitchen': createKitchen}) => {
    return createKitchen('day');
  },
  containerRoot: 'app'
}).catch((e) => {
  process.stderr.write(e.stack);
  process.exit(1);
});
