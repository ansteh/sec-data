const _           = require('lodash');
const assert      = require('assert');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'sec-data';

const execute = (operation) => {
  let instance;

  return MongoClient.connect(url)
    .then((client) => {
      instance = client;
      return client.db(dbName);
    })
    .then(operation)
    .then((result) => {
      instance.close();
      return result;
    })
    .catch((err) => {
      instance.close();
      throw new Error(err);
    });
};

const dropCollection = _.curry((collectionName, db) => {
  return db.dropCollection(collectionName);
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
      assert.equal(2, result.result.n);
      assert.equal(2, result.ops.length);
      console.log("Inserted 2 documents into the collection");

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

const getHistoricals = _.curry((range, db) => {
  const collection = db.collection('stocks');
  const pipeline = [
    { $match: { ticker: 'AAPL' } },
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
        console.log(`getHistoricals`, result);
        resolve(result);
      }
    });
  });
});

module.exports = {
  dropCollection: () => {
    return execute(dropCollection('stocks'));
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