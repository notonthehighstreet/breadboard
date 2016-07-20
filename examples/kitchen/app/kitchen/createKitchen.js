module.exports = ({
  debug,
  fs,
  '/stove/turnOn': turnOn,
  '/kitchen/data.json': data,
  '/logger': logger,
  'react-dom/server': ReactDOMServer,
  'react': React
}) => {
  return goodWhat => {
    setTimeout(() => {
      const d = debug('kitchen');

      fs.readFile('../../package.json', (err, packageJsonContents) => {
        d(JSON.parse(packageJsonContents.toString()).dependencies);
        d(ReactDOMServer.renderToString(<marquee>{data.name}</marquee>));
        logger('Have a good %s!', goodWhat);
        turnOn(data.name);
      });
    }, 200);

    return Promise.resolve('DINNER TIME');
  };
};
