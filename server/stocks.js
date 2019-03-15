const _           = require('lodash');
const assert      = require('assert');
const moment      = require('moment');

const MongoClient = require('mongodb').MongoClient;

const config = require('./credentials.json');

const getSourceUrl = () => {
  const user = encodeURIComponent(config.client.user);
  const password = encodeURIComponent(config.client.password);
  return `mongodb://${user}:${password}@${config.remote.host}:${config.remote.port}`;
};

const execute = (operation) => {
  const source = getSourceUrl();
  let instance;

  return MongoClient.connect(source, { useNewUrlParser: true })
    .then((client) => {
      instance = client;
      return client.db('sec-data');
    })
    .then(operation)
    .then((result) => {
      instance.close();
      return result;
    })
    .catch((err) => {
      if(instance) {
        instance.close();
      }
      throw new Error(err);
    });
};

const dropCollection = _.curry((collectionName, db) => {
  return db.dropCollection(collectionName);
});

const findAllTickers = (db) => {
  const collection = db.collection('stocks');

  return new Promise((resolve, reject) => {
    collection.find({}, { projection: { _id: 1, ticker: 1 } })
      .toArray((err, stocks) => {
        if(err) {
          reject(err);
        } else {
          resolve(stocks);
        }
      });
  });
};

const findByTicker = _.curry((ticker, db) => {
  return db.collection('stocks').findOne(
    { ticker },
    { projection: { _id: 1 }, limit: 1 },
  );
});

const findStocks = _.curry((clauses, db) => {
  const collection = db.collection('stocks');

  return new Promise((resolve, reject) => {
    collection.find(clauses).toArray((err, stocks) => {
      if(err) {
        reject(err);
      } else {
        resolve(stocks);
      }
    });
  });
});

const insertStocks = _.curry((stocks, db) => {
  const collection = db.collection('stocks');

  return collection.insertMany(stocks)
    .then((result) => {
      // assert.equal(2, result.result.n);
      // assert.equal(2, result.ops.length);
      // console.log("Inserted 2 documents into the collection");

      return result;
    });
});

const updateStock = _.curry((stock, db) => {
  const collection = db.collection('stocks');
  const ticker = _.get(stock, 'resource.ticker');
  const content = _.pick(stock, ['resource', 'summary']); // 'historicals'

  return collection.updateOne({ ticker }, { $set: content })
    .then((result) => {
      console.log(`${ticker} updated!`);
      return result;
    });
});

const appendHistoricalPricesBy = _.curry((stock, db) => {
  const collection = db.collection('stocks');
  const ticker = _.get(stock, 'ticker');
  const series = _.get(stock, 'series');

  const inserts = {
    $push: { historicals: { $each: series } }
  };

  return collection.updateOne({ ticker }, inserts)
    .then((result) => {
      console.log(`${ticker} updated!`);
      return result;
    });
});

const removeHistoricalPricesByDateStrings = _.curry((params, db) => {
  const collection = db.collection('stocks');
  const ticker = _.get(params, 'ticker');
  const dates = _.get(params, 'dates');

  const removes = {
    $pull: { historicals: { date: { $in: dates } } }
  };

  return collection.updateOne({ ticker }, removes)
    .then((result) => {
      console.log(`${ticker} cleared by removing date strings!`);
      return result;
    });
});

const findLastHistoricals = _.curry((params, db) => {
  const collection = db.collection('stocks');

  let pipeline = [];

  if(_.has(params, 'ticker')) {
    pipeline.push({ $match: { ticker: params.ticker } });
  }

  pipeline.push({
    $project: {
      ticker: 1,
      historical: { $arrayElemAt: [ "$historicals", -1 ] }
    }
  });

  if(_.has(params, 'olderThan')) {
    const unit = _.get(params, 'olderThan.unit');
    const value = _.get(params, 'olderThan.value');

    pipeline.push({
      $match: {
        // historical: null
        'historical.date': {
          $lte: moment().subtract(value, unit).toDate()
        }
      }
    });
  }

  return new Promise((resolve, reject) => {
    collection.aggregate(pipeline).toArray((err, result) => {
      if(err) {
        reject(err);
      } else {
        // console.log(`getHistoricals`, result);
        resolve(result);
      }
    });
  });
});

const getHistoricals = _.curry(({ ticker, range }, db) => {
  const collection = db.collection('stocks');
  const pipeline = [
    { $match: { ticker } },
    // { $unwind: '$historicals' },
    // { $project: {_id : 0, ticker: 1, historicals: 1 } },
    {
      $project: {
        historicals: {
          $filter: {
            input: '$historicals',
            as: 'item',
            cond: { $gt: ['$$item.date', range.start ] }
          }
        }
      }
    }
  ];

  return new Promise((resolve, reject) => {
    collection.aggregate(pipeline).toArray((err, result) => {
      if(err) {
        reject(err);
      } else {
        // console.log(`getHistoricals`, result);
        resolve(result);
      }
    });
  });
});

const getAllHistoricalsByTickers = _.curry(({ tickers, range }, db) => {
  const collection = db.collection('stocks');

  const pipeline = [
    {
      $match: {
        ticker: { $in: tickers },
      }
    },
  ];

  if(range) {
    pipeline.push({
      $project: {
        ticker: 1,
        historicals: {
          $filter: {
            input: '$historicals',
            as: 'item',
            cond: { $gt: ['$$item.date', range.start ] }
          }
        }
      }
    });
  } else {
    pipeline.push({ $project: { ticker: 1, historicals: 1 } });
  }

  return new Promise((resolve, reject) => {
    collection.aggregate(pipeline).toArray((err, result) => {
      if(err) {
        reject(err);
      } else {
        // console.log(`getHistoricals`, result);
        resolve(result);
      }
    });
  });
});

const removeQuotesFromStockByIndices = _.curry(({ ticker, indices }, db) => {
  const collection = db.collection('stocks');

  let nulledAllDuplicates = Promise.resolve();

  if(indices.length > 0) {
    const unset = _.reduce(indices, (accu, index) => {
      accu[`historicals.${index}`] = 1;
      return accu;
    }, {});

    nulledAllDuplicates = collection.updateOne({ ticker }, { $unset: unset })
      .then((result) => {
        console.log(`${ticker} updated!`);
        return result;
      })
  }

  return nulledAllDuplicates
    .then(() => {
      return collection.updateOne({ ticker }, { $pull: { historicals: null } })
        .then((result) => {
          console.log(`${ticker} updated!`);
          return result;
        })
    });
});

module.exports = {
  execute,
  appendHistoricalPricesBy: (stock) => {
    return execute(appendHistoricalPricesBy(stock))
  },
  dropCollection: () => {
    return execute(dropCollection('stocks'));
  },
  findAllTickers: () => {
    return execute(findAllTickers)
  },
  findByTicker: (ticker) => {
    return execute(findByTicker(ticker))
  },
  findStocks: (stocks) => {
    return execute(findStocks(stocks));
  },
  findLastHistoricals: (params) => {
    return execute(findLastHistoricals(params));
  },
  getHistoricals: (options) => {
    return execute(getHistoricals(options));
  },
  getAllHistoricalsByTickers: (options) => {
    return execute(getAllHistoricalsByTickers(options));
  },
  removeHistoricalPricesByDateStrings: (params) => {
    return execute(removeHistoricalPricesByDateStrings(params));
  },
  removeQuotesFromStockByIndices: (params) => {
    return execute(removeQuotesFromStockByIndices(params));
  },
  insertStocks: (stocks) => {
    return execute(insertStocks(stocks));
  },
  updateStock: (stock) => {
    return execute(updateStock(stock));
  },
};
