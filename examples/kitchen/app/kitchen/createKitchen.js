module.exports = (deps) => {
  return function createKitchen() {
    const turnOn = deps['/stove/turnOn'];
    const data = deps['/kitchen/data.json'];
    const debug = deps['debug'];
    const fs = deps['fs'];
    const d = debug('di:createKitchen');

    fs.readFile('../../package.json', (err, packageJsonContents) => {
      d(packageJsonContents.toString());
      turnOn(data.name);
    });
  };
};
