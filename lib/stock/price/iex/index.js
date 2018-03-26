const got    = require('got');
const moment = require('moment');
const _      = require('lodash');

const ENDPOINT = 'https://api.iextrading.com/1.0';

const RANGES = {
  '1m': (duration) => {
    return duration.months() <= 1;
  },
  '3m': (duration) => {
    return duration.months() <= 3;
  },
  '6m': (duration) => {
    return duration.months() <= 6;
  },
  '1y': (duration) => {
    return duration.years() <= 1;
  },
  '2y': (duration) => {
    return duration.years() <= 2;
  },
  '5y': (duration) => {
    return duration.years() <= 5;
  },
};

const getRange = ({ from }) => {
  const start = moment(from);
  const end = moment();

  const duration = moment.duration(end.diff(start));

  return _.findKey(RANGES, (matches) => {
    return matches(duration);
  });
};

const slice = (series, startDate) => {
  const start = moment(moment(startDate).format('YYYY-MM-DD'));

  const startIndex = _.findIndex(series, ({ date }) => {
    const current = moment(moment(date).format('YYYY-MM-DD'));
    return current.isSameOrAfter(start);
  });

  return _.slice(series, startIndex, series.length);
};

const getTimeseries = (params) => {
  const range = getRange(params) || '5y';

  const url = `${ENDPOINT}/stock/${params.symbol}/time-series/${range}`;

  return got(url)
    .then((res) => {
      return JSON.parse(res.body);
    })
    .then((series) => {
      return slice(series, params.from);
    })
};

// getTimeseries({ symbol: 'AAPL', from: '2017-04-23' })
//   // .then(series => series.length)
//   .then(_.first)
//   .then(console.log)
//   .catch(console.log)

module.exports = {
  getTimeseries,
};
