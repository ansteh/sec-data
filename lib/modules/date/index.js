const _ = require('lodash');

const treefy = (series) => {
  const tree = {};

  _.forEach(series, (entry) => {
    let [year, month, date] = pathDate(entry.date);

    if(tree[year] === undefined) {
      tree[year] = {};
    }

    if(tree[year][month] === undefined) {
      tree[year][month] = {};
    }

    tree[year][month][date] = entry;
  });

  return tree;
};

const pathDate = (date) => {
  return date.substr(0, 10)
    .split('-')
    .map(parseFloat);
};

const get = (tree, date) => {
  const path = pathDate(date);
  return _.get(tree, path);
};

const getNearest = (tree, date) => {
  const paths = pathDate(date);
  return getNearestByPaths(tree, paths);
};

const getNearestByPaths = (tree, paths, tries = 9) => {
  const entry = _.get(tree, paths);

  if(entry) {
    return entry
  }

  if(tries === 0) {
    return undefined;
  }

  tries -= 1;
  paths = getPrevious(paths);

  return getNearestByPaths(tree, paths, tries);
};

const getPrevious = (paths) => {
  let [year, month, date] = paths;

  if(date === 1) {
    date = 31;

    if(month === 1) {
      month = 12;
      year -= 1;
    } else {
      month -= 1;
    }
  } else {
    date -= 1;
  }

  return [year, month, date];
};

module.exports = {
  getNearest,
  treefy,
};
