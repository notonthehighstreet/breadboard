module.exports = (deps) => {
  return function createKitchen(goodWhat) {
    const debug = deps['debug'];

    setTimeout(() => {
      const turnOn = deps['/stove/turnOn'];
      const data = deps['/kitchen/data.json'];
      const fs = deps['fs'];
      const logger = deps['/logger'];
      const d = debug('kitchen');

      fs.readFile('../../package.json', (err, packageJsonContents) => {
        d(packageJsonContents.toString());
        logger('Have a good %s!', goodWhat);
        turnOn(data.name);
      });
    }, 200);
  };
};
