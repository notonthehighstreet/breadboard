module.exports = (deps) => {
  return function turnOn(name) {
    const logger = deps['/logger'];

    logger(`Turning the stove on, ${name}`);
  };
};
