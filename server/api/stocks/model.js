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

const filter = _.curry(({ find, options }, db) => {
  return new Promise((resolve, reject) => {
    db.collection('stocks').find(find, options).toArray((err, stocks) => {
      if(err) {
        reject(err);
      } else {
        resolve(stocks);
      }
    });
  });
});

const aggregate = _.curry(({ pipeline, options }, db) => {
  return new Promise((resolve, reject) => {
    db.collection('stocks').aggregate(pipeline, options).toArray((err, stocks) => {
      if(err) {
        reject(err);
      } else {
        resolve(stocks);
      }
    });
  });
});

module.exports = {
  aggregate: (options) => {
    return Stocks.execute(aggregate(options));
  },
  getResources: () => {
    return Stocks.execute(getResources);
  },
  filter: (options) => {
    return Stocks.execute(filter(options));
  },
  getResourcesByTicker: () => {
    return Stocks.execute(getResourcesByTicker);
  },
};
