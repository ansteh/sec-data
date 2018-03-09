const _      = require('lodash');
const moment = require('moment');

const Queries = require('./queries.js');

const aggregateBy = (path, { ticker, date }) => {
  const end = moment(date).startOf('day').add(1, 'days');
  const start = moment(end).subtract(1, 'year');

  return Queries.aggregateBy(path, {
    ticker,
    start: start.toDate(),
    end: end.toDate()
  });
};

const aggregateBy__DerivedDCF_IntrinsicValue = ({ ticker, date }) => {
  return aggregateBy('annual.DerivedDCF_IntrinsicValue', { ticker, date });
};

const filterBy__DerivedDCF_IntrinsicValue = ({ ticker, date }) => {
  const target = moment(date).startOf('day');
  const yearAgo = moment(date).subtract(1, 'year');

  const find = {
    ticker,
    // 'summary.annual.DerivedDCF_IntrinsicValue.endDate': date,
    // 'summary.annual.DerivedDCF_IntrinsicValue.endDate': { "$gte": yearAgo.toDate(), "$lt": target.toDate() },
  };

  const options = {
    projection: {
      ticker: 1,
      'summary.annual.DerivedDCF_IntrinsicValue': 1,
    }
  };

  return { find, options };
};

module.exports = {
  aggregateBy,
  aggregateBy__DerivedDCF_IntrinsicValue,
  filterBy__DerivedDCF_IntrinsicValue,
};
