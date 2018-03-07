const _      = require('lodash');
const Stocks = require('../../stocks.js');

const getResourcesByOptions = _.curry((options, ticker, db) => {
  return db.collection('stocks').findOne({ ticker }, options);
});

const getHistoricals = _.curry((ticker, db) => {
  const options = {
    projection: {
      _id: 1,
      historicals: 1,
    },
  };

  return getResourcesByOptions(options, ticker, db)
    .then(result => _.get(result, 'historicals'))
});

const findByTicker = _.curry((ticker, db) => {
  const options = {
    projection: {
      _id: 1,
      resource: 1,
    },
  };

  return getResourcesByOptions(options, ticker, db)
    .then(result => _.get(result, 'resource'))
});

const getSummary = _.curry((ticker, db) => {
  const options = {
    projection: {
      _id: 1,
      summary: 1,
    },
  };

  return getResourcesByOptions(options, ticker, db)
    .then(stock => _.keyBy([_.get(stock, 'summary')], 'ticker'))
});

module.exports = {
  getHistoricals: (ticker) => {
    return Stocks.execute(getHistoricals(ticker));
  },
  findByTicker: (ticker) => {
    return Stocks.execute(findByTicker(ticker));
  },
  getSummary: (ticker) => {
    return Stocks.execute(getSummary(ticker));
  },
};
