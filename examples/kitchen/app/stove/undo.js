module.exports = ({
  '/logger': logger
}) => name => logger(`Undoing the stove, ${name}`);
