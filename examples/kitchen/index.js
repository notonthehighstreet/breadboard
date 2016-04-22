require('../../index')({
  entry: (deps) => {
    deps['/kitchen/createKitchen']('day');
  },
  containerRoot: 'app'
});
