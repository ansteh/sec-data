const moment = require('moment');
const _         = require('lodash');
const Promise   = require('bluebird');

const DateReducer = require('./date.reducer');

const getDiff = (start, end, unit = 'days') => {
  return DateReducer.parseDate(start).diff(DateReducer.parseDate(end), unit);
};

const createDiffFilter = _.curry((delimiter, compare, collection) => {
  const candidates = _.filter(collection, (item) => {
    const difference = getDiff(item.endDate, item.startDate, delimiter);
    return compare(difference);
  });

  return toTimeseries(candidates);
});

const toTimeseries = (collection) => {
  return _
    .chain(collection)
    .uniqBy(({ member, value, startDate, endDate }) => {
      return `${member} ${value} ${startDate} ${endDate}`;
    })
    .groupBy('endDate')
    .map((group) => {
      if(group.length < 2) {
        return _.first(group);
      } else {
        const value = _.max(_.map(group, 'value'));
        return _.find(group, { value });
      }
    })
    .sortBy((item) => {
      return DateReducer.parseDate(item.startDate).toDate();
    })
    .sortBy((item) => {
      return DateReducer.parseDate(item.endDate).toDate();
    })
    .value();
};

const filterAnnualPeriods = createDiffFilter('days', (diff) => {
  return diff >= 320;
});

const filterQuartelyPeriods = createDiffFilter('days', (diff) => {
  return diff < 180;
});

module.exports = {
  createDiffFilter,
  filterAnnualPeriods,
  filterQuartelyPeriods,
  toTimeseries,
}
