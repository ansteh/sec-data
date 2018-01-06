const _ = require('lodash');

const takeFrom = require('../../modules/timeseries/take.js');

const getMetric = _.curry((summary, path) => {
  if(path.indexOf('FundamentalAccountingConcepts') != -1) {
    return getFundamentalMetric(summary, path);
  }

  return _.get(summary, path);
});

const getFundamentalMetric = _.curry((summary, path) => {
  const paths = path.split('.');

  const fundamentalMetricsPath = _.slice(paths, 0, paths.length-1).join('.');
  const property = _.last(paths);

  const periods = _.get(summary, fundamentalMetricsPath);

  return _.map(periods, (period) => {
    return {
      endDate: _.get(period, 'DocumentPeriodEndDate'),
      value: _.get(period, property),
    };
  });
});

const take = (summary, path, date) => {
  const series = getMetric(summary, path);
  return takeFrom(series, 'endDate', date);
};

module.exports = {
  getMetric,
  take,
};
