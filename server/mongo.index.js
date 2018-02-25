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

const stocks = [
  { ticker: 'AAPL' },
  { ticker: 'GM' },
];

// execute(insertStocks(stocks))
//   .then((rows) => {
//     console.log('insertStocks inserted', rows);
//   })
//   .catch(console.log);

execute(findStocks({}))
  .then(console.log)
  .catch(console.log);
