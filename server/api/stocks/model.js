const _      = require('lodash');
const Stocks = require('../../stocks.js');

const getResources = (db) => {
  const collection = db.collection('stocks');
  const options = {
    projection: {
      _id: 1,
      'resource.ticker': 1,
      'resource.cik': 1,
      'resource.name': 1,
      'resource.sic': 1,
      'resource.forms': 1,
    },
    // limit: 10
  };

  return new Promise((resolve, reject) => {
    collection.find({}, options).toArray((err, stocks) => {
      if(err) {
        reject(err);
      } else {
        resolve(stocks);
      }
    });
  });
};

const getResourcesByTicker = (db) => {
  return getResources(db)
    .then((resources) => {
      return _
        .chain(resources)
        .map('resource')
        .keyBy('ticker')
        .value();
    })
};

module.exports = {
  getResources: () => {
    return Stocks.execute(getResources);
  },
  getResourcesByTicker: () => {
    return Stocks.execute(getResourcesByTicker);
  },
};
