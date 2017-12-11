const moment = require('moment');
const _      = require('lodash');

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_PATH = 'date';

const { treefy, getNearest } = require('../../modules/date');

const findAllByFormat = _.curry((data, path, dates) => {
  const find = findByFormat(data, path);
  return _.map(dates, find);
});

const matchByFormat = (data, path, date, charsLength = 7) => {
  const monthPattern = date.substr(0, charsLength);

  const candidates = _
    .chain(data)
    .filter((entry) => {
      const value = _.get(entry, path);
      return _.includes(value, monthPattern);
    })
    .value();

  return findByDate(candidates, path, date);
};

const takeByFormat = (data, path, date, charsLength = 7) => {
  const pattern = date.substr(0, charsLength);

  const candidates = _
    .chain(data)
    .filter((entry) => {
      const value = _.get(entry, path);
      return _.includes(value, pattern);
    })
    .value();

  const index = findIndexByDate(candidates, path, date);
  const endIndex = _.findIndex(data, candidates[index]);

  if(index > -1) {
    return _.slice(data, 0, endIndex+1);
  }
};

const findByFormat = _.curry((data, path, date) => {
  return matchByFormat(data, path, date);
});

const findByDate = (entries, path, date) => {
  const index = findIndexByDate(entries, path, date);
  if(index > -1) return entries[index];
};

const findIndexByDate = (entries, path, date) => {
  const dateStr = getDate(date);

  const diffs = _.map(entries, (entry) => {
    const value = _.get(entry, path);
    return Math.abs(dateStr - getDate(value));
  });
  // console.log(diffs);

  const min = _.min(diffs);

  return _.findLastIndex(diffs, x => x === min);
}

const getDate = (dateStr) => {
  return parseInt(dateStr.substr(8));
};

const StockPrices = (historical) => {
  const find = findByFormat(historical, DATE_PATH);
  const findAll = findAllByFormat(historical, DATE_PATH);

  const isEmpty = () => {
    return _.isEmpty(historical);
  };

  const getData = (startDate, endDate) => {
    let data = historical;

    if(startDate) {
      const entry = find(startDate);
      const index = _.findIndex(historical, entry);

      data = _.slice(data, index);
    }

    if(endDate) {
      const entry = find(endDate);
      const index = _.findIndex(historical, entry);

      data = _.slice(data, 0, index);
    }

    return data;
  }

  return {
    findByFormat: find,
    findAllByFormat: findAll,
    getData,
    isEmpty,
  };
};

const TreeStockPrices = (historical) => {
  const prices = StockPrices(historical);

  let tree = treefy(historical);

  const findByFormat = (date) => {
    return getNearest(tree, date);
  };

  const findAllByFormat = (dates) => {
    return _.map(dates, findByFormat);
  };

  return {
    findByFormat,
    findAllByFormat,
    getData: prices.getData,
    isEmpty: prices.isEmpty,
  };
};

module.exports = {
  StockPrices,
  TreeStockPrices,

  findByFormat,
  matchByFormat,
  takeByFormat,
};
