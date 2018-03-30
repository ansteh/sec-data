const got    = require('got');
const moment = require('moment');
const _      = require('lodash');

const ENDPOINT = 'https://api.iextrading.com/1.0';

const RANGES = {
  '1m': (days) => {
    return days <= 30;
  },
  '3m': (days) => {
    return days <= 90;
  },
  '6m': (days) => {
    return days <= 175;
  },
  '1y': (days) => {
    return days <= 365;
  },
  '2y': (days) => {
    return days <= 750;
  },
  '5y': (days) => {
    return days <= 1825;
  },
};

const getRange = ({ from }) => {
  const start = moment(from);
  const end = moment();

  const days = end.diff(start, 'days');

  return _.findKey(RANGES, (matches) => {
    return matches(days);
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
  // console.log(url);
  
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

// console.log('range', getRange({ from: '2006-01-01'}))

module.exports = {
  getTimeseries,
};
