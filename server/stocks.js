const _           = require('lodash');
const assert      = require('assert');

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

  return MongoClient.connect(source)
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
  const content = _.pick(stock, ['resource', 'summary', 'historicals']);

  return collection.updateOne({ ticker }, { $set: content })
    .then((result) => {
      console.log(`${ticker} updated!`);
      return result;
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

module.exports = {
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
  getHistoricals: (range) => {
    return execute(getHistoricals(range));
  },
  insertStocks: (stocks) => {
    return execute(insertStocks(stocks));
  },
  updateStock: (stock) => {
    return execute(updateStock(stock));
  },
};
