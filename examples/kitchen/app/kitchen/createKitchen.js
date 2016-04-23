module.exports = ({
  debug,
  fs,
  '/stove/turnOn': turnOn,
  '/kitchen/data.json': data,
  '/logger': logger
}) => {
  return goodWhat => {
    setTimeout(() => {
      const d = debug('kitchen');

      fs.readFile('../../package.json', (err, packageJsonContents) => {
        d(packageJsonContents.toString());
        // console.log(typeof logger);
        logger('Have a good %s!', goodWhat);
        turnOn(data.name);
      });
    }, 200);
  };
};
