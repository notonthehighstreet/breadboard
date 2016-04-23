/*eslint no-console: 0*/
module.exports = () => {
  return (...args) => {
    console.log.apply(console, args);
  };
};
