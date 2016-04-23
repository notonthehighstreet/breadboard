import breadboard from '../../index';

module.exports = breadboard({
  entry: ({'/kitchen/createKitchen': createKitchen}) => {
    createKitchen('day');
  },
  containerRoot: 'app'
});
