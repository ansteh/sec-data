const moment = require('moment');
const _         = require('lodash');
const Promise   = require('bluebird');

const DATE_FORMAT = 'YYYY-MM-DD';

const parseDate = (dateStr) => {
  return moment(dateStr, DATE_FORMAT);
};

const getDiff = (start, end, unit = 'days') => {
  return parseDate(start).diff(parseDate(end), unit);
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
    .uniqBy(({ value, startDate, endDate }) => {
      return `${value} ${startDate} ${endDate}`;
    })
    .sortBy((item) => {
      return parseDate(item.startDate).toDate();
    })
    .sortBy((item) => {
      return parseDate(item.endDate).toDate();
    })
    .reverse()
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
