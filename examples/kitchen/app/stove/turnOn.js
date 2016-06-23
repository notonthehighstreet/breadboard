module.exports = ({
  '/logger': logger,
  '/stove/undo': undoStove
}) => {
  return name => {
    logger(`Turning the stove on, ${name}`);
    undoStove(name);
  };
};
