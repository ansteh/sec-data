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
  return _
    .chain(collection)
    .filter((item) => {
      const difference = getDiff(item.endDate, item.startDate, delimiter);
      return compare(difference);
    })
    .uniqBy(({ value, startDate, endDate }) => {
      return `${value} ${startDate} ${endDate}`;
    })
    .sortBy((item) => {
      return parseDate(item.startDate).toDate();
    })
    .sortBy((item) => {
      return parseDate(item.endDate).toDate();
    })
    .value();
});

const filterAnnualPeriods = createDiffFilter('days', (diff) => {
  return diff >= 320;
});

const filterQuartelyPeriods = createDiffFilter('days', (diff) => {
  return diff < 180;
});

const getMetrics = _.curry((ticker, entry, collection) => {
  return Promise.all(collection)
    .then((batches) => {
      return _
        .chain(batches)
        .flatten()
        .uniqBy(({ value, startDate, endDate }) => {
          return `${value} ${startDate} ${endDate}`;
        })
        .sortBy((item) => {
          return parseDate(item.startDate).toDate();
        })
        .sortBy((item) => {
          return parseDate(item.endDate).toDate();
        })
        .value();
    });
});

module.exports = {
  createDiffFilter,
  filterAnnualPeriods,
  filterQuartelyPeriods,
  getMetrics,
}
