module.exports = ({'/logger': logger}) => {
  return name => logger(`Turning the stove on, ${name}`);
};
