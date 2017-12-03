const moment = require('moment');
const _      = require('lodash');

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_PATH = 'date';

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

const findByFormat = _.curry((data, path, date) => {
  return matchByFormat(data, path, date);
});

const findByDate = (entries, path, date) => {
  const dateStr = getDate(date);

  const diffs = _.map(entries, (entry) => {
    const value = _.get(entry, path);
    return Math.abs(dateStr - getDate(value));
  });

  const min = _.min(diffs);

  const index = _.findLastIndex(diffs, x => x === min);

  // console.log(diffs);
  // console.log(min);
  // console.log(index);

  if(index > -1)return entries[index];
};

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

module.exports = {
  StockPrices,

  findByFormat,
  matchByFormat,
};
