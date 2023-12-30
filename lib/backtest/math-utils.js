const _ = require("lodash");

const add = (a, b) => {
  return a + b;
};

const sub = (a, b) => {
  return a - b;
};

const addAll = (items = [], path) => {
  return items.reduce((total, item) => {
    const value = path ? _.get(item, path) : item;
    return add(total, value);
  }, 0);
};

const mul = (a, b) => {
  return a * b;
};

const div = (a, b) => {
  return a / b;
};

module.exports = {
  add,
  addAll,
  div,
  mul,
  sub,
};
