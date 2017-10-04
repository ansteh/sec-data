const moment = require('moment');
const _         = require('lodash');
const Promise   = require('bluebird');

const DateReducer = require('./date.reducer');

const toTimeseries = (collection) => {
  return _
    .chain(collection)
    .uniqBy(({ member, instant, value }) => {
      return `${member} ${instant} ${value}`;
    })
    .sortBy((item) => {
      return DateReducer.parseDate(item.instant).toDate();
    })
    .reverse()
    .value();
};

module.exports = {
  toTimeseries,
}
