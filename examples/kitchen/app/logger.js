/*eslint no-console: 0*/
module.exports = () => {
  return function logger() {
    console.log.apply(console, arguments);
  };
};
